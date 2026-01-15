import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAsset } from './portfolioAsset.entity';
import {
  PortfolioAssetMetrics,
  PortfolioAssetsOverview,
  GetPortfoliosAssetsDto,
  GetPortfoliosAssetsParamsDto,
  UpdatePortfolioDto,
  FindPortfolioAssetDto
} from './portfoliosAssets.dto';
import { Operation, OperationTypes } from '../operations/operation.entity';
import { GetRequestResponse } from '../common/dto/request';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { AssetClasses } from '../assets/asset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { Currencies } from '../common/enums/number';
import { OperationsExchangeRatesService } from '../operationsExchangeRates/operationsExchangeRates.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';

interface PortfolioAssetProfitability {
  profitability: number;
  profitabilityInPercentage: number;
  totalProfitability: number;
  totalProfitabilityInPercentage: number;
}
interface AssetProfit {
  cost: number;
  value: number;
}

@Injectable()
export class PortfoliosAssetsService {
  private readonly logger = new Logger(PortfoliosAssetsService.name);

  constructor(
    @InjectRepository(PortfolioAsset) private readonly portfolioAssetRepository: Repository<PortfolioAsset>,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly operationsExchangeRatesService: OperationsExchangeRatesService
  ) {}

  public async get(
    getPortfolioAssetsParamsDto?: GetPortfoliosAssetsParamsDto
  ): Promise<GetRequestResponse<GetPortfoliosAssetsDto>> {
    const { relations, portfolioId, assetId, open } = getPortfolioAssetsParamsDto || {};
    const page: number | null = getPortfolioAssetsParamsDto?.page ? Number(getPortfolioAssetsParamsDto.page) : null;
    const limit: number | null =
      getPortfolioAssetsParamsDto?.limit && getPortfolioAssetsParamsDto.limit !== '0'
        ? Number(getPortfolioAssetsParamsDto.limit)
        : null;
    const subQuery = this.portfolioAssetRepository.manager
      .createQueryBuilder(AssetHistoricalPrice, 'assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      });
    const builder = this.portfolioAssetRepository
      .createQueryBuilder('portfolioAsset')
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrice',
        `assetHistoricalPrice.id IN (${subQuery.select('id').getQuery()})`
      )
      .orderBy('asset.ticker');

    if (relations?.length) {
      relations.forEach((relation) => {
        builder.leftJoinAndSelect(`portfolioAsset.${relation.name}`, relation.alias);
      });
    }

    if (portfolioId) {
      builder.andWhere('portfolioAsset.portfolioId = :portfolioId', { portfolioId });
    }

    if (assetId) {
      builder.andWhere('portfolioAsset.assetId = :assetId', { assetId });
    }

    if (open !== undefined && open !== null) {
      builder.andWhere('portfolioAsset.quantity > 0');
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const portfolioAssets = await builder.getMany();
    const total = await builder.getCount();
    const usdBrlExchangeRate = await this.marketIndexHistoricalDataService.findMostRecent('USD/BRL');

    return {
      data: portfolioAssets.map((portfolioAsset) => {
        if (portfolioAsset.asset.class === AssetClasses.Cryptocurrency) {
          portfolioAsset.quantity -= portfolioAsset.fees;
        }

        return Object.assign(portfolioAsset, { usdBrlExchangeRate });
      }),
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async getPortfolioAssetsOverview(portfolioId: number): Promise<PortfolioAssetsOverview> {
    let portfolioOverview: PortfolioAssetsOverview = {
      currentBalance: 0,
      investedBalance: 0,
      profit: 0,
      profitability: 0
    };
    const { data: portfolioAssets } = await this.get({
      portfolioId,
      relations: [
        { name: 'operations', alias: 'operation' },
        { name: 'payouts', alias: 'payout' }
      ]
      // order: {
      //   operations: {
      //     date: 'ASC'
      //   },
      //   payouts: {
      //     date: 'ASC'
      //   }
      // }
    });

    if (portfolioAssets.length) {
      const usdBrlExchangeRates = await this.operationsExchangeRatesService.getUsdBrlExchangeRates(portfolioAssets);

      portfolioOverview = portfolioAssets.reduce(
        (acc, portfolioAsset) => {
          const assetCurrentValue = this.getPortfolioAssetCurrentValue(portfolioAsset, usdBrlExchangeRates);
          const unrealizedProfit = this.calculateUnrealizedProfit(
            portfolioAsset,
            assetCurrentValue,
            usdBrlExchangeRates
          );
          const realizedProfit = this.calculateRealizedProfit(portfolioAsset, usdBrlExchangeRates);
          const profit = this.calculateTotalProfit(unrealizedProfit, realizedProfit, portfolioAsset, true);

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

  public async getPortfolioAssetMetrics(portfolioId: number, id: number): Promise<PortfolioAssetMetrics> {
    this.logger.log(
      `[getPortfolioAssetMetrics] Getting metrics for portfolio asset ${id} in portfolio ${portfolioId}...`
    );

    const portfolioAsset = await this.find(id, {
      relations: [
        { name: 'operations', alias: 'operation' },
        { name: 'payouts', alias: 'payout' }
      ]
    });
    const { data: portfolioAssets } = await this.get({ portfolioId: portfolioId, open: true });
    const assetCurrentPrice = portfolioAsset.asset.assetHistoricalPrices[0].closingPrice;
    const portfolioAssetCurrentValue = this.getPortfolioAssetCurrentValue(portfolioAsset);
    const assetClassCurrentValue = this.getAssetsCurrentValue(portfolioAssets, portfolioAsset.asset.class);
    // const contribution = this.calculateContribution(
    //   portfolioAssets,
    //   portfolioAsset,
    //   portfolioAssetCurrentValue,
    //   usdBrlExchangeRate
    // );
    const { profitability, profitabilityInPercentage, totalProfitability, totalProfitabilityInPercentage } =
      this.calculateProfitability(portfolioAsset, portfolioAssetCurrentValue);

    this.logger.log(
      `[getPortfolioAssetMetrics] Metrics for portfolio asset ${id} in portfolio ${portfolioId} successfully retrieved`
    );

    return {
      id: portfolioAsset.id,
      adjustedCost: portfolioAsset.adjustedCost,
      averageCost: portfolioAsset.averageCost,
      characteristic: portfolioAsset.characteristic,
      contribution: 0,
      cost: portfolioAsset.cost,
      currentPercentage: portfolioAssetCurrentValue / assetClassCurrentValue,
      minPercentage: portfolioAsset.minPercentage,
      maxPercentage: portfolioAsset.maxPercentage,
      payoutsReceived: portfolioAsset.payoutsReceived,
      portfolioId: portfolioAsset.portfolioId,
      position: portfolioAssetCurrentValue,
      profitability,
      profitabilityInPercentage,
      quantity: portfolioAsset.quantity,
      salesTotal: portfolioAsset.salesTotal,
      totalProfitability,
      totalProfitabilityInPercentage,
      yieldOnCost: portfolioAsset.payoutsReceived / portfolioAsset.adjustedCost,
      asset: {
        id: portfolioAsset.assetId,
        allTimeHighPrice: portfolioAsset.asset.allTimeHighPrice,
        category: portfolioAsset.asset.category,
        class: portfolioAsset.asset.class,
        currency: portfolioAsset.asset.currency,
        currentPrice: assetCurrentPrice,
        dropOverAverageCost: this.calculateDrop(
          portfolioAsset.averageCost,
          portfolioAsset.asset.assetHistoricalPrices[0].closingPrice
        ),
        dropOverAllTimeHigh: this.calculateDrop(
          portfolioAsset.asset.allTimeHighPrice,
          portfolioAsset.asset.assetHistoricalPrices[0].closingPrice
        ),
        sector: portfolioAsset.asset.sector,
        ticker: portfolioAsset.asset.ticker
      }
    };
  }

  public async update(portfolioAssetId: number, updatePortfolioAssetDto: UpdatePortfolioDto): Promise<PortfolioAsset> {
    const portfolioAsset = await this.find(portfolioAssetId);
    const updatedPortfolioAsset = this.portfolioAssetRepository.merge(
      Object.assign({}, portfolioAsset),
      updatePortfolioAssetDto
    );

    await this.portfolioAssetRepository.save(updatedPortfolioAsset);

    return updatedPortfolioAsset;
  }

  public async delete(portfolioAssetId: number): Promise<void> {
    const portfolioAsset = await this.find(portfolioAssetId);

    await this.portfolioAssetRepository.manager.transaction(async (entityManager) => {
      await entityManager.delete(Operation, { portfolioAssetId: portfolioAsset.id });
      await entityManager.delete(PortfolioAsset, { id: portfolioAsset.id });
    });
  }

  public async find(id: number, findPortfolioAssetDto?: FindPortfolioAssetDto): Promise<PortfolioAsset> {
    const subQuery = this.portfolioAssetRepository.manager
      .createQueryBuilder(AssetHistoricalPrice, 'assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      });
    const builder = this.portfolioAssetRepository
      .createQueryBuilder('portfolioAsset')
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrice',
        `assetHistoricalPrice.id IN (${subQuery.select('id').getQuery()})`
      )
      .where('portfolioAsset.id = :id', { id });

    if (findPortfolioAssetDto?.relations?.length) {
      findPortfolioAssetDto.relations.forEach((relation) => {
        builder.leftJoinAndSelect(`portfolioAsset.${relation.name}`, relation.alias);
      });
    }

    const portfolioAsset = await builder.getOne();

    if (!portfolioAsset) {
      throw new NotFoundException('Portfolio asset not found');
    }

    this.logger.log(`[find] Portfolio Asset ${portfolioAsset.id} found`);

    return portfolioAsset;
  }

  private getPortfolioAssetCurrentValue(
    portfolioAsset: PortfolioAsset,
    usdBrlExchangeRates?: MarketIndexHistoricalData[]
  ): number {
    this.logger.log('[getPortfolioAssetCurrentValue] Calculating asset current value...');

    let price = portfolioAsset.asset.assetHistoricalPrices[0]?.closingPrice || 0;
    let quantity = portfolioAsset.quantity;

    if (portfolioAsset.asset?.class === AssetClasses.Cryptocurrency) {
      quantity -= portfolioAsset.fees;
    }

    if (portfolioAsset.asset?.currency === Currencies.USD && usdBrlExchangeRates?.length) {
      const lastUsdBrlExchangeRate = usdBrlExchangeRates[0].value;

      price *= lastUsdBrlExchangeRate;
    }

    return portfolioAsset.quantity * price;
  }

  private calculateProfitability(
    portfolioAsset: PortfolioAsset,
    assetCurrentValue: number
  ): PortfolioAssetProfitability {
    this.logger.log('[calculateProfitability] Calculating asset profitability...');

    const unrealizedProfit = this.calculateUnrealizedProfit(portfolioAsset, assetCurrentValue);
    const realizedProfit = this.calculateRealizedProfit(portfolioAsset);
    const profit = this.calculateTotalProfit(unrealizedProfit, realizedProfit, portfolioAsset);

    return {
      profitability: unrealizedProfit.value,
      profitabilityInPercentage: unrealizedProfit.value ? unrealizedProfit.value / unrealizedProfit.cost : 0,
      totalProfitability: profit.value,
      totalProfitabilityInPercentage: profit.value ? profit.value / profit.cost : 0
    };
  }

  private calculateUnrealizedProfit(
    portfolioAsset: PortfolioAsset,
    assetCurrentValue: number,
    usdBrlExchangeRates?: MarketIndexHistoricalData[]
  ): AssetProfit {
    this.logger.log('[calculateUnrealizedProfit] Calculating asset unrealized profit...');

    if (!assetCurrentValue) {
      return { value: 0, cost: 0 };
    }

    let cost = portfolioAsset.adjustedCost + portfolioAsset.taxes;

    if (portfolioAsset.asset?.class !== AssetClasses.Cryptocurrency) {
      cost += portfolioAsset.fees;
    }

    if (portfolioAsset.asset?.currency === Currencies.USD && usdBrlExchangeRates?.length) {
      const lastUsdBrlExchangeRate = usdBrlExchangeRates[0].value;

      cost *= lastUsdBrlExchangeRate;
    }

    return { value: assetCurrentValue - cost, cost };
  }

  private calculateRealizedProfit(
    portfolioAsset: PortfolioAsset,
    usdBrlExchangeRates?: MarketIndexHistoricalData[]
  ): AssetProfit {
    this.logger.log('[calculateRealizedProfit] Calculating asset realized profit...');

    if (!portfolioAsset.salesTotal) {
      return { value: 0, cost: 0 };
    }

    let adjustedSalesTotal = portfolioAsset.salesTotal;
    let cost = portfolioAsset.salesCost + portfolioAsset.taxes;

    if (portfolioAsset.asset?.class !== AssetClasses.Cryptocurrency) {
      cost += portfolioAsset.fees;
    }

    if (portfolioAsset.asset?.currency === Currencies.USD) {
      adjustedSalesTotal = 0;
      cost = 0;

      portfolioAsset.operations.forEach((operation) => {
        const lastUsdBrlExchangeRateBeforeOperation =
          usdBrlExchangeRates?.find((indexData) => new Date(indexData.date) < new Date(operation.date))?.value || 1;

        if (operation.type === OperationTypes.Buy) {
          cost += operation.total * lastUsdBrlExchangeRateBeforeOperation;
        } else {
          adjustedSalesTotal += operation.total * lastUsdBrlExchangeRateBeforeOperation;
        }
      });
    }

    return { value: adjustedSalesTotal - cost, cost };
  }

  private calculateTotalProfit(
    unrealizedProfit: AssetProfit,
    realizedProfit: AssetProfit,
    portfolioAsset: PortfolioAsset,
    adjustByCurrency?: boolean
  ): AssetProfit {
    this.logger.log('[calculateTotalProfit] Calculating asset total profit...');

    let adjustedPayoutsReceived = portfolioAsset.payoutsReceived;

    if (portfolioAsset.asset.currency === Currencies.USD && adjustByCurrency) {
      adjustedPayoutsReceived = portfolioAsset.payouts.reduce((totalPayment, payout) => {
        const usdBrlExchangeRate = payout.withdrawalDateExchangeRate || payout.receivedDateExchangeRate;

        return payout.total * usdBrlExchangeRate + totalPayment;
      }, 0);
    }

    return {
      value: unrealizedProfit.value + realizedProfit.value + adjustedPayoutsReceived,
      cost: unrealizedProfit.cost + realizedProfit.cost
    };
  }

  private calculateContribution(
    portfoliosAssets: GetPortfoliosAssetsDto[],
    portfolioAsset: PortfolioAsset,
    portfolioAssetCurrentValue: number,
    usdBrlExchangeRate?: MarketIndexHistoricalData
  ): number {
    //     function calculateAssetContributionSafe(
    // ...   assetValue,
    // ...   portfolioValue,
    // ...   totalContribution,
    // ...   targetPercentage
    // ... ) {
    // ...   const x =
    // ...     targetPercentage * (portfolioValue + totalContribution) - assetValue;
    // ... 
    // ...   if (x <= 0) return 0;                 // ativo já acima do target
    // ...   if (x >= totalContribution) return totalContribution; // tudo nele
    // ... 
    // ...   return x;
    // ... }


    // const portfolioAssetTotalValueByClass = this.getAssetsCurrentValue(portfoliosAssets, portfolioAsset.asset.class);

    // const targetPercentage = portfolioAsset.minPercentage || portfolioAsset.maxPercentage || 0;
    // let adjustedPortfolioAssetCurrentValue = portfolioAssetCurrentValue;

    // if (portfolioAsset.asset?.currency === Currencies.USD && usdBrlExchangeRate) {
    //   adjustedPortfolioAssetCurrentValue *= usdBrlExchangeRate.value;
    // }

    // return targetPercentage
    //   ? (targetPercentage * portfolioAssetTotalValueByClass - adjustedPortfolioAssetCurrentValue) /
    //       (1 - targetPercentage)
    //   : 0;

    return 0;
  }

  private getAssetsCurrentValue(portfolioAssets: GetPortfoliosAssetsDto[], assetClass?: AssetClasses): number {
    let filteredPortfolioAssets = portfolioAssets;

    if (assetClass) {
      filteredPortfolioAssets = filteredPortfolioAssets.filter(
        (portfolioAsset) => portfolioAsset.asset?.class === assetClass
      );
    }

    return filteredPortfolioAssets.reduce(
      (totalValue, portfolioAsset) => (totalValue += this.getPortfolioAssetCurrentValue(portfolioAsset)),
      0
    );
  }

  private calculateDrop(priceToCompare: number, assetCurrentPrice: number): number {
    return priceToCompare > assetCurrentPrice ? (priceToCompare - assetCurrentPrice) / priceToCompare : 0;
  }
}
