import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BuySell, BuySellTypes } from './buySell.entity';
import { WalletsService } from '../wallets/wallets.service';
import { AssetsService } from '../assets/assets.service';
import { WalletsAssetsService } from '../walletsAssets/walletsAssets.service';
import { CreateBuySellDto } from './buysSells.dto';
import { Wallet } from '../wallets/wallet.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { Quota } from '../quotas/quota.entity';
import { Asset } from '../assets/asset.entity';

// When implementing statistics of profitability, consider the closest quotas before the base dates. So, if the comparison is between October 1st and October 21st, the quota for October 1st should be the closest one before October 1st. Same for October 21st

@Injectable()
export class BuysSellsService {
  constructor(
    @InjectRepository(BuySell) private readonly buysSellsRepository: Repository<BuySell>,
    private readonly dateHelper: DateHelper,
    private readonly walletsService: WalletsService,
    private readonly assetsService: AssetsService,
    private readonly walletsAssetsService: WalletsAssetsService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async create(walletId: number, createBuySellDto: CreateBuySellDto): Promise<BuySell> {
    const wallet = await this.walletsService.find(walletId, ['buysSells', 'quotas'], {
      buysSells: { date: 'ASC' },
      quotas: { date: 'DESC' }
    });
    const { quantity, assetId, price, type, date, institution, fees } = createBuySellDto;
    const asset = await this.assetsService.find(assetId);
    const buySell = new BuySell(quantity, price, type, date, institution, asset.id, wallet.id, fees);
    const adjustedBuySell = this.getAdjustedBuySellValues(buySell, asset);
    const walletAsset = await this.createOrUpdateWalletAsset(walletId, asset.id, adjustedBuySell);
    const quota = await this.createOrUpdateWalletQuota(wallet, buySell, asset);

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, walletAsset, quota]);
    });

    return buySell;
  }

  public async get(walletId: number): Promise<BuySell[]> {
    const buysSells = await this.buysSellsRepository.find({
      where: { walletId },
      order: { date: 'DESC' },
      relations: ['asset']
    });

    return buysSells;
  }

  private async createOrUpdateWalletAsset(
    walletId: number,
    assetId: number,
    adjustedBuySell: BuySell
  ): Promise<WalletAsset> {
    let walletAsset = await this.walletsAssetsService.find(walletId, assetId);

    if (walletAsset) {
      if (adjustedBuySell.type === BuySellTypes.Buy) {
        walletAsset.quantity += adjustedBuySell.quantity;
        walletAsset.cost += adjustedBuySell.quantity * adjustedBuySell.price;
        walletAsset.position = walletAsset.cost;
        walletAsset.averageCost = (walletAsset.position + (adjustedBuySell.fees || 0)) / walletAsset.quantity;
      } else {
        if (adjustedBuySell.quantity > walletAsset.quantity) {
          throw new ConflictException('Quantity is higher than the current position');
        }

        walletAsset.quantity -= adjustedBuySell.quantity;
        walletAsset.position = walletAsset.quantity * walletAsset.averageCost;
        walletAsset.salesTotal += adjustedBuySell.quantity * adjustedBuySell.price - (adjustedBuySell.fees || 0);

        if (walletAsset.quantity === 0) {
          walletAsset.averageCost = 0;
        }
      }
    } else {
      if (adjustedBuySell.type === BuySellTypes.Sell) {
        new ConflictException('You are not positioned in this asset');
      }

      const cost = adjustedBuySell.quantity * adjustedBuySell.price;
      const averageCost = cost / adjustedBuySell.quantity;

      walletAsset = new WalletAsset(assetId, walletId, adjustedBuySell.quantity, cost, cost, averageCost);
    }

    return walletAsset;
  }

  private async createOrUpdateWalletQuota(wallet: Wallet, adjustedBuySell: BuySell, asset: Asset): Promise<Quota> {
    let createdOrUpdatedQuota: Quota;

    if (wallet.quotas?.[0]) {
      const quotaForCurrentDay = wallet.quotas.find((quota) => quota.date === adjustedBuySell.date);
      const lastQuotaBeforeCurrentDay = wallet.quotas.find(
        (quota) => new Date(quota.date).getTime() < new Date(adjustedBuySell.date).getTime()
      );
      const walletsAssets = await this.walletsAssetsService.get({ walletId: wallet.id });
      const dayBeforeBuyOrSell = this.dateHelper.format(
        this.dateHelper.subtractDays(new Date(adjustedBuySell.date), 1),
        'MM-dd-yyyy'
      );
      const assetHistoricalPricesOnMostRecentDayBeforeBuyOrSell =
        await this.assetHistoricalPricesService.getMostRecentsBeforeDate(
          walletsAssets.map((walletAsset) => walletAsset.assetId),
          dayBeforeBuyOrSell
        );
      const buysSellsOfBuySellDay = wallet.buysSells
        .filter(
          (buySell) =>
            this.dateHelper.format(new Date(buySell.date), 'MM-dd-yyyy') ===
            this.dateHelper.format(new Date(adjustedBuySell.date), 'MM-dd-yyyy')
        )
        .map((buySell) => this.getAdjustedBuySellValues(buySell, asset));
      const valueOfBuysSellsOnBuySellDay = buysSellsOfBuySellDay.reduce((value, buySell) => {
        const buySellTotalValue = buySell.quantity * buySell.price;

        return buySell.type === BuySellTypes.Buy ? (value += buySellTotalValue) : (value -= buySellTotalValue);
      }, 0);
      const walletValueOnDayBeforeBuySell = walletsAssets.reduce((walletValue, walletAsset) => {
        const assetHistoricalPrice = assetHistoricalPricesOnMostRecentDayBeforeBuyOrSell.find(
          (assetHistoricalPrice) => assetHistoricalPrice.assetId === walletAsset.assetId
        );
        const assetQuantityBoughtOnBuySellDay = buysSellsOfBuySellDay
          .filter((buySell) => buySell.assetId === walletAsset.assetId)
          .reduce((quantity, buySell) => (quantity += buySell.quantity), 0);
        return (walletValue +=
          assetHistoricalPrice.closingPrice * (walletAsset.quantity - assetQuantityBoughtOnBuySellDay));
      }, 0);
      const walletCurrentValue =
        adjustedBuySell.quantity * adjustedBuySell.price + walletValueOnDayBeforeBuySell + valueOfBuysSellsOnBuySellDay;
      const quotaValueOnDayBeforeBuySell = walletValueOnDayBeforeBuySell / lastQuotaBeforeCurrentDay.quantity;
      const updatedQuantity = walletCurrentValue / quotaValueOnDayBeforeBuySell;

      if (quotaForCurrentDay) {
        quotaForCurrentDay.quantity = updatedQuantity;
        quotaForCurrentDay.value = walletCurrentValue / updatedQuantity;

        createdOrUpdatedQuota = quotaForCurrentDay;
      } else {
        createdOrUpdatedQuota = new Quota(adjustedBuySell.date, walletCurrentValue, wallet.id, updatedQuantity);
      }

      // console.log({
      //   quotaForCurrentDay,
      //   lastQuotaBeforeCurrentDay,
      //   dayBeforeBuyOrSell,
      //   assetHistoricalPricesOnMostRecentDayBeforeBuyOrSell,
      //   buysSellsOfBuySellDay,
      //   valueOfBuysSellsOnBuySellDay,
      //   walletValueOnDayBeforeBuySell,
      //   walletCurrentValue,
      //   quotaValueOnDayBeforeBuySell,
      //   updatedQuantity,
      //   createdOrUpdatedQuota
      // });
    } else {
      const totalBuyOrSellValue = adjustedBuySell.quantity * adjustedBuySell.price;

      createdOrUpdatedQuota = new Quota(adjustedBuySell.date, totalBuyOrSellValue, wallet.id);
    }

    return createdOrUpdatedQuota;
  }

  private getAdjustedBuySellValues(buySell: BuySell, asset: Asset): BuySell {
    const adjustedBuySell = Object.assign({}, buySell);
    const splitsAfterBuySellDate = asset.splitHistoricalEvents.filter(
      (split) => new Date(split.date).getTime() > new Date(buySell.date).getTime()
    );

    if (splitsAfterBuySellDate.length) {
      let adjustedQuantity = buySell.quantity;
      let adjustedPrice = buySell.price;

      splitsAfterBuySellDate.forEach((split) => {
        adjustedQuantity = (adjustedQuantity * split.numerator) / split.denominator;
        adjustedPrice = (adjustedPrice / split.numerator) * split.denominator;
      });

      adjustedBuySell.quantity = adjustedQuantity;
      adjustedBuySell.price = adjustedPrice;
    }

    return adjustedBuySell;
  }
}
