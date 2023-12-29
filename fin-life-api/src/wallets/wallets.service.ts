import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Wallet } from './wallet.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { UsersService } from '../users/users.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { CreateWalletDto, WalletOverview } from './wallet.dto';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { Quota } from '../quotas/quota.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private readonly walletsRepository: Repository<Wallet>,
    private readonly dateHelper: DateHelper,
    private readonly usersService: UsersService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async create(userId: number, createWalletDto: CreateWalletDto): Promise<Wallet> {
    const user = await this.usersService.findUser(userId);
    const wallet = new Wallet(createWalletDto.description, user.id);

    await this.walletsRepository.save(wallet);

    return wallet;
  }

  public async getWalletOverview(walletId: number): Promise<WalletOverview> {
    const { walletAssets, quotas } = await this.find(walletId, ['walletAssets', 'quotas'], { quotas: { date: 'ASC' } });
    const currentBalance = await this.getWalletCurrentBalance(walletAssets);
    const investedBalance = this.getWalletInvestedBalance(walletAssets);
    const profitability = this.getWalletProfitability(quotas, currentBalance);
    const profit = Number((currentBalance - investedBalance).toFixed(2));

    return {
      currentBalance,
      investedBalance,
      profit,
      profitability
    };
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

  private async getWalletCurrentBalance(walletAssets: WalletAsset[]): Promise<number> {
    let balance = 0;

    if (walletAssets.length) {
      const latestAssetPrices = await this.getAssetLatestPrices(walletAssets);

      balance = latestAssetPrices.reduce((balance, assetPrice) => {
        const assetQuantity = walletAssets.find((walletAsset) => walletAsset.assetId === assetPrice.assetId).quantity;

        return (balance += assetQuantity * assetPrice.closingPrice);
      }, 0);
    }

    return balance;
  }

  private async getAssetLatestPrices(walletAssets: WalletAsset[]): Promise<AssetHistoricalPrice[]> {
    const today = this.dateHelper.format(this.dateHelper.subtractDays(new Date(), 1), 'yyyy-MM-dd');
    const latestAssetPrices = await this.assetHistoricalPricesService.getMostRecentsBeforeDate(
      walletAssets.map((walletAsset) => walletAsset.assetId),
      today
    );

    return latestAssetPrices;
  }

  private getWalletInvestedBalance(walletAssets: WalletAsset[]): number {
    let investedBalance = 0;

    if (walletAssets.length) {
      investedBalance = walletAssets.reduce((balance, walletAsset) => (balance += walletAsset.position), 0);
    }

    return investedBalance;
  }

  private getWalletProfitability(quotas: Quota[], currentBalance: number): number {
    const firstQuotaValue = quotas[0].value;
    const lastQuota = quotas[quotas.length - 1];
    const currentQuotaValue = Number((currentBalance / lastQuota.quantity).toFixed(2));

    return Number(((currentQuotaValue - firstQuotaValue) / firstQuotaValue).toFixed(2));
  }
}
