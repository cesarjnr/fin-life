import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Portfolio } from './portfolio.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { UsersService } from '../users/users.service';
import { AssetsService } from '../assets/assets.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { PortfolioOverview, PutPorfolioDto } from './portfolio.dto';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfoliosRepository: Repository<Portfolio>,
    private readonly dateHelper: DateHelper,
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async create(userId: number, createPortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    const user = await this.usersService.find({ id: userId });
    const portfolio = new Portfolio(createPortfolioDto.description, user.id);

    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }

  public async get(userId: number): Promise<Portfolio[]> {
    const portfolios = await this.portfoliosRepository.find({ where: { userId } });

    return portfolios;
  }

  public async getOverview(portfolioId: number): Promise<PortfolioOverview> {
    const portfolio = await this.find(portfolioId, ['portfolioAssets.asset']);
    const tickers = portfolio.portfolioAssets.map((portfolioAsset) => portfolioAsset.asset.ticker);
    const assets = await this.assetsService.get({ tickers });

    return portfolio.portfolioAssets.reduce(
      (acc, portfolioAsset) => {
        const asset = assets.find((asset) => asset.id === portfolioAsset.assetId);
        const assetCurrentValue = asset.assetHistoricalPrices[0].closingPrice * portfolioAsset.quantity;
        const profit =
          assetCurrentValue + portfolioAsset.salesTotal + portfolioAsset.dividendsPaid - portfolioAsset.adjustedCost;

        acc.currentBalance += assetCurrentValue;
        acc.investedBalance += portfolioAsset.adjustedCost;
        acc.profit += profit;
        acc.profitability += profit / portfolioAsset.adjustedCost;

        return acc;
      },
      { currentBalance: 0, investedBalance: 0, profit: 0, profitability: 0 }
    );
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
}
