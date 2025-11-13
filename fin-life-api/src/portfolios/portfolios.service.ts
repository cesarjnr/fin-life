import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Portfolio } from './portfolio.entity';
import { UsersService } from '../users/users.service';
import { PortfolioOverview, PutPorfolioDto } from './portfolio.dto';
import { AssetsService } from '../assets/assets.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfoliosRepository: Repository<Portfolio>,
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService
  ) {}

  public async create(userId: number, createPortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    const user = await this.usersService.find({ id: userId, relations: ['portfolios'] });
    const portfolio = new Portfolio(createPortfolioDto.description, user.id, createPortfolioDto.default);

    this.validateDefaultPortfolio(user.portfolios, portfolio);
    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }

  public async get(userId: number): Promise<Portfolio[]> {
    const portfolios = await this.portfoliosRepository.find({ where: { userId } });

    return portfolios;
  }

  public async getOverview(portfolioId: number): Promise<PortfolioOverview> {
    let portfolioOverview: PortfolioOverview = { currentBalance: 0, investedBalance: 0, profit: 0, profitability: 0 };
    const portfolio = await this.find(portfolioId, ['portfolioAssets.payouts', 'buysSells'], {
      portfolioAssets: { payouts: { date: 'ASC' } },
      buysSells: { date: 'ASC' }
    });

    if (portfolio.portfolioAssets.length) {
      const usdBrlExchangeRates = await this.portfoliosAssetsService.getUsdBrlExchangeRates(portfolio.buysSells);

      portfolioOverview = portfolio.portfolioAssets.reduce(
        (acc, portfolioAsset) => {
          const assetCurrentValue = this.portfoliosAssetsService.adjustAssetCurrentValueByCurrency(
            portfolioAsset,
            usdBrlExchangeRates
          );
          const unrealizedProfit = this.portfoliosAssetsService.calculateUnrealizedProfit(
            portfolioAsset,
            assetCurrentValue,
            usdBrlExchangeRates
          );
          const realizedProfit = this.portfoliosAssetsService.calculateRealizedProfit(
            portfolioAsset,
            portfolio.buysSells,
            usdBrlExchangeRates
          );
          const profit = this.portfoliosAssetsService.calculateTotalProfit(
            unrealizedProfit,
            realizedProfit,
            portfolioAsset
          );

          acc.currentBalance += assetCurrentValue;
          acc.investedBalance += portfolioAsset.cost;
          acc.profit += profit.value;

          return acc;
        },
        { currentBalance: 0, investedBalance: 0, profit: 0, profitability: 0 }
      );

      portfolioOverview.profitability = portfolioOverview.profit / portfolioOverview.investedBalance;
    }

    return portfolioOverview;
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

    const { data: assets } = await this.assetsService.get();

    portfolio.portfolioAssets?.forEach((porttfolioAsset) => {
      porttfolioAsset.asset = assets.find((asset) => asset.id === porttfolioAsset.assetId);
    });

    return portfolio;
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

  private validateDefaultPortfolio(portfolios: Portfolio[], newPortfolio: Portfolio): void {
    const existingDefaultPortfolio = portfolios.find((portfolio) => portfolio.default);

    if (newPortfolio.default && existingDefaultPortfolio) {
      throw new ConflictException('There is already a default portfolio');
    }
  }
}
