import { Injectable } from '@nestjs/common';
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
    const wallet = await this.walletsService.find(walletId, ['buysSells', 'quotas'], { buysSells: { date: 'ASC' } });
    const { quantity, assetId, price, type, date } = createBuySellDto;
    const asset = await this.assetsService.find(assetId);
    const buySell = new BuySell(quantity, price, type, date, asset.id, wallet.id); // Add or subtract fees (if included) based on the type (buy or sell)
    const walletAsset = await this.createOrUpdateWalletAsset(walletId, assetId, buySell);
    // const quota = await this.createOrUpdateWalletQuota(wallet, buySell);

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, walletAsset /* , quota */]);
    });
    buySell.convertValueToReais();

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
        // ---> Add the buy quantity to the existing quantity
        // ---> Add the total cost of the buy (newBuyOrSell.quantity * newBuyOrSell.price) to the existing position
        // ---> Divide the new position by the new quantity to get the new average cost
        // walletAsset.quantity += newBuyOrSell.quantity;
        // walletAsset.position += newBuyOrSell.quantity * newBuyOrSell.price;
      } else {
        // ---> Subtract the sell quantity from the existing quantity
        // ---> Multiply the new quantity by the current average cost to get the new position
        // ---> If the new quantity is 0, set the current average cost to 0
        // walletAsset.quantity -= newBuyOrSell.quantity;
      }
    } else {
      walletAsset = new WalletAsset(
        assetId,
        walletId,
        newBuyOrSell.quantity,
        newBuyOrSell.quantity * newBuyOrSell.price
      );
    }

    return walletAsset;
  }

  private async createOrUpdateWalletQuota(wallet: Wallet, newBuyOrSell: BuySell): Promise<Quota> {
    const firstBuy = wallet.buysSells?.[0];

    if (firstBuy && firstBuy.date != newBuyOrSell.date) {
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
          assetHistoricalPrice.closingPrice * walletAsset.quantity - assetQuantityBoughtOnBuySellDay);
      }, 0);
      const walletTotalValue = walletValueOnDayBeforeBuySell + valueOfBuysSellsOnBuySellDay;
      // const quotaValue = walletTotalValue / wallet.numberOfQuotas;
      const walletValueAfterBuySell = walletTotalValue + newBuyOrSell.quantity * newBuyOrSell.price;

      // wallet.numberOfQuotas = Number((walletValueAfterBuySell / quotaValue).toFixed(2));
    }

    return {} as Quota;
  }
}
