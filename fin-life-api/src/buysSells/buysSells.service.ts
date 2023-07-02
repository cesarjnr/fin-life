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

@Injectable()
export class BuysSellsService {
  constructor(
    @InjectRepository(BuySell) private readonly buysSellsRepository: Repository<BuySell>,
    private readonly walletsService: WalletsService,
    private readonly assetsService: AssetsService,
    private readonly walletsAssetsService: WalletsAssetsService
  ) {}

  public async create(walletId: number, createBuySellDto: CreateBuySellDto): Promise<BuySell> {
    const wallet = await this.walletsService.find(walletId);
    const { amount, assetId, price, type, date } = createBuySellDto;
    const asset = await this.assetsService.find(assetId);
    const buySell = new BuySell(amount, price, type, date, asset.id, wallet.id);
    const walletAsset = await this.createOrUpdateWalletAsset(walletId, assetId, buySell);

    // await this.updateWalletNumberOfQuotas(wallet, buySell);
    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, walletAsset]);
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

  private async updateWalletNumberOfQuotas(wallet: Wallet, newBuyOrSell: BuySell): Promise<void> {
    const firstBuy = wallet.buysSells?.[0];

    if (firstBuy && firstBuy.date !== newBuyOrSell.date) {
      // const walletValue = wallet.buysSells.reduce((walletSum, buySell) => {
      //   return (walletSum += buySell.amount * buySell.price);
      // }, 0); // This needs to be the walletValue based on the market closing in the bay before
      // const quotaValue = walletValue / wallet.numberOfQuotas;
      // const newBuyOrSellValue = newBuyOrSell.amount * newBuyOrSell.price;
      // const walletValueAfterBuyOrSell =
      //   newBuyOrSell.type === BuySellTypes.Buy ? walletValue + newBuyOrSellValue : walletValue - newBuyOrSellValue;
      // const newWalletNumberOfQuotas = walletValueAfterBuyOrSell / quotaValue;
    }
  }
}
