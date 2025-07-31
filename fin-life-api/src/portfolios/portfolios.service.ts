import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Portfolio } from './portfolio.entity';
import { UsersService } from '../users/users.service';
import { PortfolioOverview, PutPorfolioDto } from './portfolio.dto';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { OrderBy } from '../common/dto/request';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';
import { AssetsService } from '../assets/assets.service';
import { Currencies } from '../common/enums/number';
import { DateHelper } from '../common/helpers/date.helper';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfoliosRepository: Repository<Portfolio>,
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly dateHelper: DateHelper
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
    const portfolio = await this.find(portfolioId, ['portfolioAssets.payouts', 'buysSells'], {
      portfolioAssets: { payouts: { date: 'ASC' } },
      buysSells: { date: 'ASC' }
    });
    const usdBrlExchangeRates = await this.getUsdBrlExchangeRates(portfolio);
    const portfolioOverview = portfolio.portfolioAssets.reduce(
      (acc, portfolioAsset) => {
        const assetCurrentValue = this.adjustAssetCurrentValueByCurrency(portfolioAsset, usdBrlExchangeRates);
        const unrealizedProfit = this.adjustUnrealizedProfitByCurrency(
          portfolioAsset,
          assetCurrentValue,
          usdBrlExchangeRates
        );
        const realizedProfit = this.adjustRealizedProfitsByCurrency(
          portfolioAsset,
          portfolio.buysSells,
          usdBrlExchangeRates
        );
        const profit = this.adjustProfitByCurrency(assetCurrentValue, unrealizedProfit, realizedProfit, portfolioAsset);

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

  private async getUsdBrlExchangeRates(portfolio: Portfolio): Promise<MarketIndexHistoricalData[]> {
    const foreignOperations = portfolio.buysSells.filter((operation) => operation.currency === Currencies.USD);
    const firstForeignOperation = foreignOperations[0];
    const firstForeignPayouts = portfolio.portfolioAssets
      .map((portfolioAsset) => portfolioAsset.payouts[0])
      .filter((payout) => payout && payout.currency === Currencies.USD);
    const firstForeignPayout = firstForeignPayouts[0];
    const firstForeignOperationDate = new Date(`${firstForeignOperation.date}T00:00:00.000`);
    const firstForeignPayoutDate = new Date(`${firstForeignPayout.date}T00:00:00.000`);
    const lowestDate = this.dateHelper.isBefore(firstForeignOperationDate, firstForeignPayoutDate)
      ? firstForeignOperationDate
      : firstForeignPayoutDate;
    const from = this.dateHelper.format(this.dateHelper.startOfMonth(lowestDate), 'yyyy-MM-dd');
    const result = await this.marketIndexHistoricalDataService.get({
      ticker: 'USD/BRL',
      from,
      orderByColumn: 'date',
      orderBy: OrderBy.Desc
    });

    return result.data;
  }

  private adjustAssetCurrentValueByCurrency(
    portfolioAsset: PortfolioAsset,
    usdBrlExchangeRates: MarketIndexHistoricalData[]
  ): number {
    let price = portfolioAsset.asset.assetHistoricalPrices[0].closingPrice;

    if (portfolioAsset.asset?.currency === Currencies.USD) {
      const lastUsdBrlExchangeRate = usdBrlExchangeRates[0].value;

      price = price * lastUsdBrlExchangeRate;
    }

    return portfolioAsset.quantity * price;
  }

  private adjustUnrealizedProfitByCurrency(
    portfolioAsset: PortfolioAsset,
    assetAdjustedCurrentValue: number,
    usdBrlExchangeRates: MarketIndexHistoricalData[]
  ): number {
    let adjustedCostToUse = portfolioAsset.adjustedCost;

    if (portfolioAsset.asset?.currency === Currencies.USD) {
      const lastUsdBrlExchangeRate = usdBrlExchangeRates[0].value;

      adjustedCostToUse = adjustedCostToUse * lastUsdBrlExchangeRate;
    }

    return assetAdjustedCurrentValue - adjustedCostToUse;
  }

  private adjustRealizedProfitsByCurrency(
    portfolioAsset: PortfolioAsset,
    buysSells: BuySell[],
    usdBrlExchangeRates: MarketIndexHistoricalData[]
  ): number {
    let adjustedSalesTotal = portfolioAsset.salesTotal;
    let adjustedCost = portfolioAsset.cost;

    if (portfolioAsset.asset?.currency === Currencies.USD) {
      adjustedSalesTotal = 0;
      adjustedCost = 0;

      buysSells
        .filter((operation) => operation.assetId === portfolioAsset.assetId)
        .forEach((operation) => {
          const lastUsdBrlExchangeRateBeforeOperation = usdBrlExchangeRates.find(
            (indexData) => new Date(indexData.date) < new Date(operation.date)
          );

          if (operation.type === BuySellTypes.Buy) {
            adjustedCost += operation.total * lastUsdBrlExchangeRateBeforeOperation.value;
          } else {
            adjustedSalesTotal += operation.total * lastUsdBrlExchangeRateBeforeOperation.value;
          }
        });
    }

    return adjustedSalesTotal - adjustedCost;
  }

  private adjustProfitByCurrency(
    assetAdjustedCurrentValue: number,
    adjustedUnrealizedProfit: number,
    adjustedRealizedProfit: number,
    portfolioAsset: PortfolioAsset
  ): number {
    let adjustedPayoutsReceived = portfolioAsset.payoutsReceived;

    if (portfolioAsset.asset.currency === Currencies.USD) {
      adjustedPayoutsReceived = portfolioAsset.payouts.reduce((totalPayment, payout) => {
        const usdBrlExchangeRate = payout.withdrawalDateExchangeRate || payout.receivedDateExchangeRate;

        return payout.total * usdBrlExchangeRate + totalPayment;
      }, 0);
    }

    return assetAdjustedCurrentValue + adjustedUnrealizedProfit + adjustedRealizedProfit + adjustedPayoutsReceived;
  }
}
