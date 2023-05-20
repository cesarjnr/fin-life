import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BuySell, BuySellType } from './buySell.entity';
import { WalletsService } from '../wallets/wallets.service';
import { AssetsService } from '../assets/assets.service';
import { CreateBuySellDto } from './buysSells.dto';
import { Wallet } from '../wallets/wallet.entity';

@Injectable()
export class BuysSellsService {
  constructor(
    @InjectRepository(BuySell) private readonly buysSellsRepository: Repository<BuySell>,
    private readonly walletsService: WalletsService,
    private readonly assetsService: AssetsService
  ) {}

  public async create(walletId: number, createBuySellDto: CreateBuySellDto): Promise<BuySell> {
    const wallet = await this.walletsService.find(walletId);
    const { amount, assetId, price, type, date } = createBuySellDto;
    const asset = await this.assetsService.find(assetId);
    const buySell = new BuySell(amount, price, type, new Date(date), asset.id, wallet.id);

    await this.buysSellsRepository.save(buySell);
    buySell.convertValueToReais();

    return buySell;
  }

  private async updateWalletNumberOfQuotas(wallet: Wallet, newBuyOrSell: BuySell): Promise<void> {
    if (wallet.buysSells!.length) {
      // const walletValue = wallet.buysSells.reduce((walletSum, buySell) => {
      //   return (walletSum += buySell.amount * buySell.price);
      // }, 0); This needs to be the walletValue based on the market closing in the bay before
      // const quotaValue = walletValue / wallet.numberOfQuotas;
      // const newBuyOrSellValue = newBuyOrSell.amount * newBuyOrSell.price;
      // const walletValueAfterBuyOrSell =
      //   newBuyOrSell.type === BuySellType.Buy ? walletValue + newBuyOrSellValue : walletValue - newBuyOrSellValue;
      // const newWalletNumberOfQuotas = walletValueAfterBuyOrSell / quotaValue;
    }
  }
}
