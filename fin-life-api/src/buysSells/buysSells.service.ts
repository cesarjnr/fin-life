import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BuySell } from './buySell.entity';
import { WalletsService } from '../wallets/wallets.service';
import { AssetsService } from '../assets/assets.service';
import { CreateBuySellDto } from './buysSells.dto';

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
    const buySell = new BuySell(
      amount,
      price,
      type,
      new Date(date),
      asset,
      wallet
    );

    await this.buysSellsRepository.save(buySell);
    buySell.convertValueToReais();

    return buySell;
  }
}
