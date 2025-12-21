import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';
import {
  FindPortfolioAssetDto,
  GetPortfolioAssetMetricsDto,
  GetPortfoliosAssetsDto,
  GetPortfoliosAssetsParamsDto,
  UpdatePortfolioDto
} from './portfoliosAssets.dto';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';
import { GetRequestResponse, OrderBy } from '../common/dto/request';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { Asset, AssetClasses } from '../assets/asset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { Currencies } from '../common/enums/number';
import { DateHelper } from '../common/helpers/date.helper';
import { Payout } from '../payouts/payout.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

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

const LOAD_RELATION_PARAMETERS = new Map<
  string,
  { entity: EntityTarget<ObjectLiteral>; whereColumn: string; valueColumn: string; dependsOn?: string }
>([
  ['payouts', { entity: Payout, whereColumn: 'portfolioAssetId', valueColumn: 'id' }],
  ['asset', { entity: Asset, whereColumn: 'id', valueColumn: 'assetId' }],
  ['portfolio', { entity: Portfolio, whereColumn: 'id', valueColumn: 'portfolioId' }],
  [
    'assetHistoricalPrices',
    { entity: AssetHistoricalPrice, whereColumn: 'assetId', valueColumn: 'assetId', dependsOn: 'asset' }
  ],
  ['buysSells', { entity: BuySell, whereColumn: 'portfolioId', valueColumn: 'portfolioId', dependsOn: 'portfolio' }]
]);

@Injectable()
export class PortfoliosAssetsService {
  private readonly logger = new Logger(PortfoliosAssetsService.name);

  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPriceRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(PortfolioAsset) private readonly portfolioAssetRepository: Repository<PortfolioAsset>,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly dateHelper: DateHelper
  ) {}

  public async get(
    getPortfolioAssetsParamsDto?: GetPortfoliosAssetsParamsDto
  ): Promise<GetRequestResponse<GetPortfoliosAssetsDto>> {
    const { portfolioId, open } = getPortfolioAssetsParamsDto || {};
    const page: number | null = getPortfolioAssetsParamsDto?.page ? Number(getPortfolioAssetsParamsDto.page) : null;
    const limit: number | null =
      getPortfolioAssetsParamsDto?.limit && getPortfolioAssetsParamsDto.limit !== '0'
        ? Number(getPortfolioAssetsParamsDto.limit)
        : null;
    const subQuery = this.assetHistoricalPriceRepository
      .createQueryBuilder('assetHistoricalPrice')
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

    if (portfolioId) {
      builder.andWhere('portfolioAsset.portfolioId = :portfolioId', { portfolioId });
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

  public async update(portfolioAssetId: number, updatePortfolioAssetDto: UpdatePortfolioDto): Promise<PortfolioAsset> {
    const portfolioAsset = await this.find({ id: portfolioAssetId });
    const updatedPortfolioAsset = this.portfolioAssetRepository.merge(
      Object.assign({}, portfolioAsset),
      updatePortfolioAssetDto
    );

    await this.portfolioAssetRepository.save(updatedPortfolioAsset);

    return updatedPortfolioAsset;
  }

  public async delete(portfolioAssetId: number): Promise<void> {
    const portfolioAsset = await this.find({ id: portfolioAssetId });

    await this.portfolioAssetRepository.manager.transaction(async (entityManager) => {
      await entityManager.delete(BuySell, { assetId: portfolioAsset.assetId, portfolioId: portfolioAsset.portfolioId });
      await entityManager.delete(PortfolioAsset, {
        assetId: portfolioAsset.assetId,
        portfolioId: portfolioAsset.portfolioId
      });
    });
  }

  public async getPortfolioAssetMetrics(portfolioId: number, assetId: number): Promise<GetPortfolioAssetMetricsDto> {
    this.logger.log(`[getPortfolioAssetMetrics] Getting metrics for asset ${assetId} in portfolio ${portfolioId}...`);

    const portfolioAsset = await this.find({
      portfolioId,
      assetId,
      relations: [
        { name: 'portfolio.buysSells' },
        { name: 'payouts' },
        { name: 'asset.assetHistoricalPrices', orderByColumn: 'assetHistoricalPrices.date', orderByDirection: 'DESC' }
      ]
    });
    const { data: portfolioAssets } = await this.get({ open: true, portfolioId: portfolioId });
    const usdBrlExchangeRate = await this.marketIndexHistoricalDataService.findMostRecent('USD/BRL');
    const assetCurrentPrice = portfolioAsset.asset.assetHistoricalPrices[0].closingPrice;
    const portfolioAssetCurrentValue = this.getPortfolioAssetCurrentValue(portfolioAsset);
    const assetClassCurrentValue = this.getAssetsCurrentValue(portfolioAssets, portfolioAsset.asset.class);
    const contribution = this.calculateContribution(
      portfolioAssets,
      portfolioAsset,
      portfolioAssetCurrentValue,
      usdBrlExchangeRate
    );
    const { profitability, profitabilityInPercentage, totalProfitability, totalProfitabilityInPercentage } =
      this.calculateProfitability(portfolioAsset, portfolioAssetCurrentValue, portfolioAsset.portfolio.buysSells);

    this.logger.log(
      `[getPortfolioAssetMetrics] Metrics for asset ${assetId} in portfolio ${portfolioId} successfully retrieved`
    );

    return {
      id: portfolioAsset.id,
      adjustedCost: portfolioAsset.adjustedCost,
      averageCost: portfolioAsset.averageCost,
      characteristic: portfolioAsset.characteristic,
      contribution,
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

  public async find(findPortfolioAssetDto?: FindPortfolioAssetDto): Promise<PortfolioAsset> {
    const { id, assetId, portfolioId, relations, withAllAssetPrices } = findPortfolioAssetDto || {};
    const builder = this.portfolioAssetRepository.createQueryBuilder('portfolioAsset');

    if (id) {
      builder.andWhere('portfolioAsset.id = :id', { id });
    }

    if (assetId) {
      builder.andWhere('portfolioAsset.assetId = :assetId', { assetId });
    }

    if (portfolioId) {
      builder.andWhere('portfolioAsset.portfolioId = :portfolioId', { portfolioId });
    }

    const portfolioAsset = await builder.getOne();

    if (!portfolioAsset) {
      throw new NotFoundException('Portfolio asset not found');
    }

    if (relations?.length) {
      await this.loadRelations(portfolioAsset, findPortfolioAssetDto);
    }

    if (!withAllAssetPrices && portfolioAsset.asset?.assetHistoricalPrices?.length) {
      portfolioAsset.asset.assetHistoricalPrices = [portfolioAsset.asset.assetHistoricalPrices[0]];
    }

    this.logger.log(`[find] Portfolio Asset ${portfolioAsset.id} found`);

    return portfolioAsset;
  }

  public getPortfolioAssetCurrentValue(
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

  public calculateUnrealizedProfit(
    portfolioAsset: PortfolioAsset,
    assetAdjustedCurrentValue: number,
    usdBrlExchangeRates?: MarketIndexHistoricalData[]
  ): AssetProfit {
    this.logger.log('[calculateUnrealizedProfit] Calculating asset unrealized profit...');

    if (!assetAdjustedCurrentValue) {
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

    return { value: assetAdjustedCurrentValue - cost, cost };
  }

  public calculateRealizedProfit(
    portfolioAsset: PortfolioAsset,
    buysSells: BuySell[],
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

      buysSells
        .filter((operation) => operation.assetId === portfolioAsset.assetId)
        .forEach((operation) => {
          const lastUsdBrlExchangeRateBeforeOperation =
            usdBrlExchangeRates?.find((indexData) => new Date(indexData.date) < new Date(operation.date))?.value || 1;

          if (operation.type === BuySellTypes.Buy) {
            cost += operation.total * lastUsdBrlExchangeRateBeforeOperation;
          } else {
            adjustedSalesTotal += operation.total * lastUsdBrlExchangeRateBeforeOperation;
          }
        });
    }

    return { value: adjustedSalesTotal - cost, cost };
  }

  public calculateTotalProfit(
    unrealizedProfit: AssetProfit,
    realizedProfit: AssetProfit,
    portfolioAsset: PortfolioAsset,
    convertToReais?: boolean
  ): AssetProfit {
    this.logger.log('[calculateTotalProfit] Calculating asset total profit...');

    let adjustedPayoutsReceived = portfolioAsset.payoutsReceived;

    if (portfolioAsset.asset.currency === Currencies.USD && convertToReais) {
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

  public async getUsdBrlExchangeRates(buysSells: BuySell[]): Promise<MarketIndexHistoricalData[]> {
    const foreignOperations = buysSells.filter((operation) => operation.currency === Currencies.USD);

    if (!foreignOperations.length) {
      return [];
    }

    const firstForeignOperation = foreignOperations[0];
    const firstForeignOperationDate = new Date(`${firstForeignOperation.date}T00:00:00.000`);
    const result = await this.marketIndexHistoricalDataService.get({
      ticker: 'USD/BRL',
      from: this.dateHelper.format(this.dateHelper.startOfMonth(firstForeignOperationDate), 'yyyy-MM-dd'),
      orderByColumn: 'date',
      orderBy: OrderBy.Desc
    });

    return result.data;
  }

  private async loadRelations(
    portfolioAsset: PortfolioAsset,
    findPortfolioAssetDto: FindPortfolioAssetDto
  ): Promise<void> {
    for (const relation of findPortfolioAssetDto.relations) {
      const joins = relation.name.split('.');

      for (const join of joins) {
        const loadRelationParameters = LOAD_RELATION_PARAMETERS.get(join);

        if (
          loadRelationParameters &&
          (!loadRelationParameters.dependsOn || portfolioAsset[loadRelationParameters.dependsOn])
        ) {
          const joinRepository = this.portfolioAssetRepository.manager.getRepository(loadRelationParameters.entity);
          const rows = await joinRepository.find({
            where: { [loadRelationParameters.whereColumn]: portfolioAsset[loadRelationParameters.valueColumn] },
            order:
              join === relation.orderByColumn?.split('.')[0]
                ? { [relation.orderByColumn.split('.')[1]]: relation.orderByDirection }
                : {}
          });
          const relationData = rows.length === 1 ? rows[0] : rows;

          if (loadRelationParameters.dependsOn) {
            portfolioAsset[loadRelationParameters.dependsOn][join] = relationData;
          } else {
            portfolioAsset[join] = relationData;
          }
        }
      }
    }
  }

  private calculateProfitability(
    portfolioAsset: PortfolioAsset,
    assetCurrentValue: number,
    buysSells: BuySell[]
  ): PortfolioAssetProfitability {
    this.logger.log('[calculateProfitability] Calculating asset profitability...');

    const unrealizedProfit = this.calculateUnrealizedProfit(portfolioAsset, assetCurrentValue);
    const realizedProfit = this.calculateRealizedProfit(portfolioAsset, buysSells);
    const profit = this.calculateTotalProfit(unrealizedProfit, realizedProfit, portfolioAsset);

    console.log({ unrealizedProfit, realizedProfit, profit });

    return {
      profitability: unrealizedProfit.value,
      profitabilityInPercentage: unrealizedProfit.value ? unrealizedProfit.value / unrealizedProfit.cost : 0,
      totalProfitability: profit.value,
      totalProfitabilityInPercentage: profit.value ? profit.value / profit.cost : 0
    };
  }

  private calculateContribution(
    portfoliosAssets: GetPortfoliosAssetsDto[],
    portfolioAsset: PortfolioAsset,
    portfolioAssetCurrentValue: number,
    usdBrlExchangeRate?: MarketIndexHistoricalData
  ): number {
    const portfolioAssetTotalValueByClass = this.getAssetsCurrentValue(portfoliosAssets, portfolioAsset.asset.class);

    const targetPercentage = portfolioAsset.minPercentage || portfolioAsset.maxPercentage || 0;
    let adjustedPortfolioAssetCurrentValue = portfolioAssetCurrentValue;

    if (portfolioAsset.asset?.currency === Currencies.USD && usdBrlExchangeRate) {
      adjustedPortfolioAssetCurrentValue *= usdBrlExchangeRate.value;
    }

    return targetPercentage
      ? (targetPercentage * portfolioAssetTotalValueByClass - adjustedPortfolioAssetCurrentValue) /
          (1 - targetPercentage)
      : 0;
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
