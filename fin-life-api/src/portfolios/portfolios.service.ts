import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Portfolio } from './portfolio.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { UsersService } from '../users/users.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { PortfolioOverview, PutPorfolioDto } from './portfolio.dto';
// import { WalletAsset } from '../walletsAssets/walletAsset.entity';
// import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
// import { Quota } from '../quotas/quota.entity';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfoliosRepository: Repository<Portfolio>,
    private readonly dateHelper: DateHelper,
    private readonly usersService: UsersService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async create(userId: number, createPortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    const user = await this.usersService.findUser(userId);
    const portfolio = new Portfolio(createPortfolioDto.description, user.id);

    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }

  public async get(userId: number): Promise<Portfolio[]> {
    const portfolios = await this.portfoliosRepository.find({ where: { userId } });

    return portfolios;
  }

  public async update(portfolioId: number, updatePortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    const portfolio = await this.find(portfolioId);

    this.portfoliosRepository.merge(portfolio, updatePortfolioDto);
    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }

  public async delete(portfolioId: number): Promise<void> {
    await this.find(portfolioId);
    await this.portfoliosRepository.delete(portfolioId);
  }

  public async find(
    portfolioId: number,
    relations?: string[],
    order?: FindOptionsOrder<Portfolio>
  ): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findOne({
      order,
      relations,
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return portfolio;
  }

  public async getPortfolioOverview(portfolioId: number): Promise<PortfolioOverview> {
    // const { walletAssets, quotas } = await this.find(portfolioId, ['walletAssets', 'quotas'], {
    //   quotas: { date: 'ASC' }
    // });
    // const currentBalance = await this.getWalletCurrentBalance(walletAssets);
    // const investedBalance = this.getWalletInvestedBalance(walletAssets);
    // const profitability = this.getWalletProfitability(quotas, currentBalance);
    // const profit = Number((currentBalance - investedBalance).toFixed(2));

    return {
      currentBalance: 0,
      investedBalance: 0,
      profit: 0,
      profitability: 0
    };
  }

  // private async getWalletCurrentBalance(walletAssets: WalletAsset[]): Promise<number> {
  //   let balance = 0;

  //   if (walletAssets.length) {
  //     const latestAssetPrices = await this.getAssetLatestPrices(walletAssets);

  //     balance = latestAssetPrices.reduce((balance, assetPrice) => {
  //       const assetQuantity = walletAssets.find((walletAsset) => walletAsset.assetId === assetPrice.assetId).quantity;

  //       return (balance += assetQuantity * assetPrice.closingPrice);
  //     }, 0);
  //   }

  //   return balance;
  // }

  // private async getAssetLatestPrices(walletAssets: WalletAsset[]): Promise<AssetHistoricalPrice[]> {
  //   const today = this.dateHelper.format(this.dateHelper.subtractDays(new Date(), 1), 'yyyy-MM-dd');
  //   const latestAssetPrices = await this.assetHistoricalPricesService.getMostRecentsBeforeDate(
  //     walletAssets.map((walletAsset) => walletAsset.assetId),
  //     today
  //   );

  //   return latestAssetPrices;
  // }

  // private getWalletInvestedBalance(walletAssets: WalletAsset[]): number {
  //   let investedBalance = 0;

  //   if (walletAssets.length) {
  //     investedBalance = walletAssets.reduce((balance, walletAsset) => (balance += walletAsset.position), 0);
  //   }

  //   return investedBalance;
  // }

  // private getWalletProfitability(quotas: Quota[], currentBalance: number): number {
  //   let profitability = 0;

  //   if (quotas.length) {
  //     const firstQuotaValue = quotas[0]?.value;
  //     const lastQuota = quotas[quotas.length - 1];
  //     const currentQuotaValue = Number((currentBalance / lastQuota.quantity).toFixed(2));
  //     profitability = Number(((currentQuotaValue - firstQuotaValue) / firstQuotaValue).toFixed(2));
  //   }

  //   return profitability;
  // }
}
