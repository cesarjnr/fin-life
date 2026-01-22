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
import { OperationsFxRatesService } from '../operationsFxRates/operationsFxRates.service';
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
    private readonly operationsFxRatesService: OperationsFxRatesService
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
    // Refactor, taking too long
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
      .orderBy('asset.code');

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

  public async getPositionsOverview(portfolioId: number): Promise<PortfolioAssetsOverview> {
    this.logger.log(`[getPositionsOverview] Getting positions overview for portfolio ${portfolioId} ...`);

    const portfolioOverview: PortfolioAssetsOverview = {
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
    });

    this.logger.log(`[getPositionsOverview] ${portfolioAssets.length} positions found`);

    if (portfolioAssets.length) {
      const latestFxRate = await this.marketIndexHistoricalDataService.findMostRecent('USD/BRL');

      for (const portfolioAsset of portfolioAssets) {
        this.logger.log(`[getPositionsOverview] Calculating profits for asset ${portfolioAsset.asset.code}`);

        const assetCurrentValue = this.getPortfolioAssetCurrentValue(portfolioAsset, latestFxRate);
        const unrealizedProfit = this.calculateUnrealizedProfit(portfolioAsset, assetCurrentValue, latestFxRate);
        const realizedProfit = await this.calculateRealizedProfit(portfolioAsset, true);
        const profit = this.calculateTotalProfit(unrealizedProfit, realizedProfit, portfolioAsset, true);

        portfolioOverview.currentBalance += assetCurrentValue;
        portfolioOverview.investedBalance += portfolioAsset.cost;
        portfolioOverview.profit += profit.value;
      }

      portfolioOverview.profitability = portfolioOverview.profit / portfolioOverview.investedBalance;
    }

    this.logger.log('[getPositionsOverview] Finished getting positions overview');

    return portfolioOverview;
  }

  public async getMetrics(portfolioId: number, id: number): Promise<PortfolioAssetMetrics> {
    this.logger.log(`[getPortfolioAssetMetrics] Getting metrics for portfolio asset ${id}...`);

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
    const { profitability, profitabilityInPercentage, totalProfitability, totalProfitabilityInPercentage } =
      await this.calculateProfitability(portfolioAsset, portfolioAssetCurrentValue);

    this.logger.log(`[getPortfolioAssetMetrics] Metrics for portfolio asset ${id} successfully retrieved`);

    return {
      id: portfolioAsset.id,
      adjustedCost: portfolioAsset.adjustedCost,
      averageCost: portfolioAsset.averageCost,
      characteristic: portfolioAsset.characteristic,
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
        code: portfolioAsset.asset.code
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

  private getPortfolioAssetCurrentValue(portfolioAsset: PortfolioAsset, fxRate?: MarketIndexHistoricalData): number {
    let price = portfolioAsset.asset.assetHistoricalPrices[0]?.closingPrice || 0;

    if (portfolioAsset.asset?.currency === Currencies.USD && fxRate) {
      price *= fxRate.value;
    }

    return portfolioAsset.quantity * price;
  }

  private async calculateProfitability(
    portfolioAsset: PortfolioAsset,
    assetCurrentValue: number
  ): Promise<PortfolioAssetProfitability> {
    const unrealizedProfit = this.calculateUnrealizedProfit(portfolioAsset, assetCurrentValue);
    const realizedProfit = await this.calculateRealizedProfit(portfolioAsset);
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
    fxRate?: MarketIndexHistoricalData
  ): AssetProfit {
    if (!assetCurrentValue) {
      return { value: 0, cost: 0 };
    }

    let cost = portfolioAsset.adjustedCost + portfolioAsset.taxes;

    if (portfolioAsset.asset?.currency === Currencies.USD && fxRate) {
      cost *= fxRate.value;
    }

    return { value: assetCurrentValue - cost, cost };
  }

  private async calculateRealizedProfit(
    portfolioAsset: PortfolioAsset,
    adjustByCurrency?: boolean
  ): Promise<AssetProfit> {
    if (!portfolioAsset.salesTotal) {
      return { value: 0, cost: 0 };
    }

    let adjustedSalesTotal = portfolioAsset.salesTotal;
    let adjustedCost = portfolioAsset.salesCost;

    if (portfolioAsset.asset?.currency === Currencies.USD && adjustByCurrency) {
      const fxRate = await this.operationsFxRatesService.calculateWeightedFxRate(portfolioAsset.operations);

      adjustedSalesTotal *= fxRate;
      adjustedCost *= fxRate;
    }

    return { value: adjustedSalesTotal - adjustedCost, cost: adjustedCost };
  }

  private calculateTotalProfit(
    unrealizedProfit: AssetProfit,
    realizedProfit: AssetProfit,
    portfolioAsset: PortfolioAsset,
    adjustByCurrency?: boolean
  ): AssetProfit {
    let adjustedPayoutsReceived = portfolioAsset.payoutsReceived;

    if (portfolioAsset.asset.currency === Currencies.USD && adjustByCurrency) {
      adjustedPayoutsReceived = portfolioAsset.payouts.reduce((totalPayment, payout) => {
        const fxRate = payout.withdrawalDateExchangeRate || payout.receivedDateExchangeRate;

        return payout.total * fxRate + totalPayment;
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
