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
    const walletAsset = await this.createOrUpdateWalletAsset(walletId, asset.id, buySell);
    const quota = await this.createOrUpdateWalletQuota(wallet, buySell);

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, walletAsset, quota]);
    });

    return buySell;
  }

  private async createOrUpdateWalletAsset(
    walletId: number,
    assetId: number,
    newBuyOrSell: BuySell
  ): Promise<WalletAsset> {
    let walletAsset = await this.walletsAssetsService.find(walletId, assetId);

    if (walletAsset) {
      if (newBuyOrSell.type === BuySellTypes.Buy) {
        walletAsset.quantity += newBuyOrSell.quantity;
        walletAsset.position += newBuyOrSell.quantity * newBuyOrSell.price;
        walletAsset.averageCost = (walletAsset.position + (newBuyOrSell.fees || 0)) / walletAsset.quantity;
      } else {
        if (newBuyOrSell.quantity > walletAsset.quantity) {
          throw new ConflictException('Quantity is higher than the current position');
        }

        walletAsset.quantity -= newBuyOrSell.quantity;
        walletAsset.position = walletAsset.quantity * walletAsset.averageCost;
        walletAsset.salesTotal += newBuyOrSell.quantity * newBuyOrSell.price - (newBuyOrSell.fees || 0);

        if (walletAsset.quantity === 0) {
          walletAsset.averageCost = 0;
        }
      }
    } else {
      if (newBuyOrSell.type === BuySellTypes.Sell) {
        new ConflictException('You are not positioned in this asset');
      }

      const position = newBuyOrSell.quantity * newBuyOrSell.price;
      const averageCost = position / newBuyOrSell.quantity;

      walletAsset = new WalletAsset(assetId, walletId, newBuyOrSell.quantity, position, averageCost);
    }

    return walletAsset;
  }

  private async createOrUpdateWalletQuota(wallet: Wallet, newBuyOrSell: BuySell): Promise<Quota> {
    let createdOrUpdatedQuota: Quota;

    if (wallet.quotas?.[0]) {
      const quotaForCurrentDay = wallet.quotas.find((quota) => quota.date === newBuyOrSell.date);
      const lastQuotaBeforeCurrentDay = wallet.quotas.find(
        (quota) => new Date(quota.date).getTime() < new Date(newBuyOrSell.date).getTime()
      );
      const walletsAssets = await this.walletsAssetsService.get({ walletId: wallet.id });
      const dayBeforeBuyOrSell = this.dateHelper.format(
        this.dateHelper.subtractDays(new Date(newBuyOrSell.date), 1),
        'MM-dd-yyyy'
      );
      const assetHistoricalPricesOnMostRecentDayBeforeBuyOrSell =
        await this.assetHistoricalPricesService.getMostRecentsBeforeDate(
          walletsAssets.map((walletAsset) => walletAsset.assetId),
          dayBeforeBuyOrSell
        );
      const buysSellsOfBuySellDay = wallet.buysSells.filter(
        (buySell) =>
          this.dateHelper.format(new Date(buySell.date), 'MM-dd-yyyy') ===
          this.dateHelper.format(new Date(newBuyOrSell.date), 'MM-dd-yyyy')
      );
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
      const walletCurentValue =
        newBuyOrSell.quantity * newBuyOrSell.price + walletValueOnDayBeforeBuySell + valueOfBuysSellsOnBuySellDay;
      const quotaValueOnDayBeforeBuySell = walletValueOnDayBeforeBuySell / lastQuotaBeforeCurrentDay.quantity;
      const updatedQuantity = walletCurentValue / quotaValueOnDayBeforeBuySell;

      if (quotaForCurrentDay) {
        quotaForCurrentDay.quantity = updatedQuantity;
        quotaForCurrentDay.value = walletCurentValue / updatedQuantity;

        createdOrUpdatedQuota = quotaForCurrentDay;
      } else {
        createdOrUpdatedQuota = new Quota(newBuyOrSell.date, walletCurentValue, wallet.id, updatedQuantity);
      }
    } else {
      const totalBuyOrSellValue = newBuyOrSell.quantity * newBuyOrSell.price;

      createdOrUpdatedQuota = new Quota(newBuyOrSell.date, totalBuyOrSellValue, wallet.id);
    }

    return createdOrUpdatedQuota;
  }
}
