import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Wallet } from './wallet.entity';
import { UsersService } from '../users/users.service';
import { WalletsAssetsService } from '../walletsAssets/walletsAssets.service';
import { CreateWalletDto, PeriodReturn, WalletProfitability } from './wallet.dto';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private readonly walletsRepository: Repository<Wallet>,
    private readonly usersService: UsersService,
    private readonly walletsAssetsService: WalletsAssetsService
  ) {}

  public async create(userId: number, createWalletDto: CreateWalletDto): Promise<Wallet> {
    const user = await this.usersService.findUser(userId);
    const wallet = new Wallet(createWalletDto.description, user.id);

    await this.walletsRepository.save(wallet);

    return wallet;
  }

  public async getProfitability(walletId: number): Promise<WalletProfitability> {
    const wallet = await this.find(walletId);
    const walletAssets = await this.walletsAssetsService.get({ walletId });
    // const totalReturn = this.getTotalReturn(walletAssets, wallet);

    return {
      // total: totalReturn
    } as WalletProfitability;
  }

  public async find(walletId: number, relations?: string[], order?: FindOptionsOrder<Wallet>): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      order,
      relations,
      where: { id: walletId }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  // private getTotalReturn(walletAssets: WalletAsset[], wallet: Wallet): number {
  //   const walletCurrentValue = walletAssets.reduce((total, walletAsset) => {
  //     return (total += walletAsset.asset.assetHistoricalPrices[0].closingPrice * walletAsset.quantity);
  //   }, 0);
  //   const walletCurrentQuotaValue = walletCurrentValue / wallet.numberOfQuotas;

  //   return Number((((walletCurrentQuotaValue - wallet.quotaInitialValue) / wallet.quotaInitialValue) * 100).toFixed(2));
  // }
}
