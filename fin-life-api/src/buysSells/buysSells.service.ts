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
    const wallet = await this.walletsService.find(walletId);
    const { amount, assetId, price, type, date } = createBuySellDto;
    const asset = await this.assetsService.find(assetId);
    const buySell = new BuySell(amount, price, type, date, asset.id, wallet.id);
    const walletAsset = await this.createOrUpdateWalletAsset(walletId, assetId, buySell);

    await this.updateWallet(wallet, buySell);
    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, walletAsset, wallet]);
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
        walletAsset.quantity += newBuyOrSell.amount;
        walletAsset.cost += newBuyOrSell.amount * newBuyOrSell.price;
      } else {
        walletAsset.quantity -= newBuyOrSell.amount;
        walletAsset.cost -= newBuyOrSell.amount * newBuyOrSell.price;
      }
    } else {
      walletAsset = new WalletAsset(assetId, walletId, newBuyOrSell.amount, newBuyOrSell.amount * newBuyOrSell.price);
    }

    return walletAsset;
  }

  private async updateWallet(wallet: Wallet, newBuyOrSell: BuySell): Promise<void> {
    const firstBuy = wallet.buysSells?.[0];

    if (!firstBuy || firstBuy.date === newBuyOrSell.date) {
      wallet.walletInitialValue += newBuyOrSell.price * newBuyOrSell.amount;
      wallet.quotaInitialValue += Number((wallet.walletInitialValue / wallet.numberOfQuotas).toFixed(2));
    } else {
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
        const buySellTotalValue = buySell.amount * buySell.price;

        return buySell.type === BuySellTypes.Buy ? (value += buySellTotalValue) : (value -= buySellTotalValue);
      }, 0);
      const walletValueOnDayBeforeBuySell = walletsAssets.reduce((walletValue, walletAsset) => {
        const assetHistoricalPrice = assetHistoricalPricesOnMostRecentDayBeforeBuyOrSell.find(
          (assetHistoricalPrice) => assetHistoricalPrice.assetId === walletAsset.assetId
        );
        const assetQuantityBoughtOnBuySellDay = buysSellsOfBuySellDay
          .filter((buySell) => buySell.assetId === walletAsset.assetId)
          .reduce((quantity, buySell) => (quantity += buySell.amount), 0);

        return (walletValue +=
          assetHistoricalPrice.closingPrice * walletAsset.quantity - assetQuantityBoughtOnBuySellDay);
      }, 0);
      const walletTotalValue = walletValueOnDayBeforeBuySell + valueOfBuysSellsOnBuySellDay;
      const quotaValue = walletTotalValue / wallet.numberOfQuotas;
      const walletValueAfterBuySell = walletTotalValue + newBuyOrSell.amount * newBuyOrSell.price;

      wallet.numberOfQuotas = Number((walletValueAfterBuySell / quotaValue).toFixed(2));
    }
  }
}
