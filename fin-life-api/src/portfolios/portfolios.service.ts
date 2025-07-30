import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Portfolio } from './portfolio.entity';
import { UsersService } from '../users/users.service';
import { PortfolioOverview, PutPorfolioDto } from './portfolio.dto';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { AssetCurrencies } from '../assets/asset.entity';
import { OrderBy } from '../common/dto/request';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfoliosRepository: Repository<Portfolio>,
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
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
    const portfolio = await this.find(portfolioId, ['portfolioAssets.dividends', 'buysSells'], {
      portfolioAssets: { dividends: { date: 'DESC' } }
    });
    const { data: assets } = await this.assetsService.get();
    const { data: marketIndexHistoricalData } = await this.marketIndexHistoricalDataService.get({
      ticker: 'USD/BRL',
      orderBy: OrderBy.Desc
    });

    portfolio.portfolioAssets.forEach((porttfolioAsset) => {
      porttfolioAsset.asset = assets.find((asset) => asset.id === porttfolioAsset.assetId);
    });

    const portfolioOverview = portfolio.portfolioAssets.reduce(
      (acc, portfolioAsset) => {
        const assetCurrentValue = this.adjustAssetCurrentValueByCurrency(portfolioAsset, marketIndexHistoricalData);
        const unrealizedProfit = this.adjustUnrealizedProfitByCurrency(
          portfolioAsset,
          assetCurrentValue,
          marketIndexHistoricalData
        );
        const realizedProfit = this.adjustRealizedProfitsByCurrency(
          portfolioAsset,
          portfolio.buysSells,
          marketIndexHistoricalData
        );
        const profit = this.adjustProfitByCurrency(
          assetCurrentValue,
          unrealizedProfit,
          realizedProfit,
          portfolioAsset,
          marketIndexHistoricalData
        );

        acc.currentBalance += assetCurrentValue;
        acc.investedBalance += portfolioAsset.cost;
        acc.profit += profit;

        return acc;
      },
      { currentBalance: 0, investedBalance: 0, profit: 0, profitability: 0 }
    );

    portfolioOverview.profitability = portfolioOverview.profit / portfolioOverview.investedBalance;

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

    console.log({ portfolio });

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

  private adjustAssetCurrentValueByCurrency(
    portfolioAsset: PortfolioAsset,
    marketIndexHistoricalData: MarketIndexHistoricalData[]
  ): number {
    let priceToUse = portfolioAsset.asset.assetHistoricalPrices[0].closingPrice;

    if (portfolioAsset.asset?.currency === AssetCurrencies.USD) {
      const lastUsdBrlExchangeRate = marketIndexHistoricalData[0].value;

      priceToUse = priceToUse * lastUsdBrlExchangeRate;
    }

    return portfolioAsset.quantity * priceToUse;
  }

  private adjustUnrealizedProfitByCurrency(
    portfolioAsset: PortfolioAsset,
    assetAdjustedCurrentValue: number,
    marketIndexHistoricalData: MarketIndexHistoricalData[]
  ): number {
    let adjustedCostToUse = portfolioAsset.adjustedCost;

    if (portfolioAsset.asset?.currency === AssetCurrencies.USD) {
      const lastUsdBrlExchangeRate = marketIndexHistoricalData[0].value;

      adjustedCostToUse = adjustedCostToUse * lastUsdBrlExchangeRate;
    }

    return assetAdjustedCurrentValue - adjustedCostToUse;
  }

  private adjustRealizedProfitsByCurrency(
    portfolioAsset: PortfolioAsset,
    buysSells: BuySell[],
    marketIndexHistoricalData: MarketIndexHistoricalData[]
  ): number {
    let adjustedSalesTotal = portfolioAsset.salesTotal;
    let adjustedCost = portfolioAsset.cost;

    if (portfolioAsset.asset?.currency === AssetCurrencies.USD) {
      adjustedSalesTotal = 0;
      adjustedCost = 0;

      buysSells.forEach((buySell) => {
        if (buySell.assetId === portfolioAsset.assetId) {
          const lastUsdBrlExchangeRateBeforeBuySell = marketIndexHistoricalData.find(
            (indexData) => new Date(indexData.date) < new Date(buySell.date)
          );

          if (buySell.type === BuySellTypes.Buy) {
            adjustedCost += buySell.total * lastUsdBrlExchangeRateBeforeBuySell.value;
          } else {
            adjustedSalesTotal += buySell.total * lastUsdBrlExchangeRateBeforeBuySell.value;
          }
        }
      });
    }

    return adjustedSalesTotal - adjustedCost;
  }

  private adjustProfitByCurrency(
    assetAdjustedCurrentValue: number,
    adjustedUnrealizedProfit: number,
    adjustedRealizedProfit: number,
    portfolioAsset: PortfolioAsset,
    marketIndexHistoricalData: MarketIndexHistoricalData[]
  ): number {
    let adjustedDividendsPaid = portfolioAsset.dividendsPaid;

    if (portfolioAsset.asset.currency === AssetCurrencies.USD) {
      adjustedDividendsPaid = 0;

      portfolioAsset.dividends.forEach((dividend) => {
        const usdBrlExchangeRate =
          dividend.withdrawalDateExchangeRate ||
          dividend.receivedDateExchangeRate ||
          marketIndexHistoricalData.find((indexData) => new Date(indexData.date) < new Date(dividend.date)).value;

        adjustedDividendsPaid += dividend.total * usdBrlExchangeRate;
      });
    }

    return assetAdjustedCurrentValue + adjustedUnrealizedProfit + adjustedRealizedProfit + adjustedDividendsPaid;
  }
}
