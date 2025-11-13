import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';
import {
  GetPortfolioAssetMetricsDto,
  GetPortfoliosAssetsDto,
  GetPortfoliosAssetsParamsDto,
  UpdatePortfolioDto
} from './portfoliosAssets.dto';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';
import { GetRequestResponse, OrderBy } from '../common/dto/request';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { AssetClasses } from '../assets/asset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { Currencies } from '../common/enums/number';
import { DateHelper } from '../common/helpers/date.helper';

interface FindPortfolioAssetDto {
  id?: number;
  assetId?: number;
  portfolioId?: number;
  relations?: string[];
  order?: {
    asset?: {
      assetHistoricalPrices?: {
        date: 'ASC' | 'DESC';
      };
    };
  };
  withAllAssetPrices?: boolean;
}
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
    const { portfolioId } = getPortfolioAssetsParamsDto || {};
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
    const portfolioAsset = await this.find({
      portfolioId,
      assetId,
      order: { asset: { assetHistoricalPrices: { date: 'DESC' } } },
      relations: ['portfolio.buysSells']
    });
    const assetCurrentPrice = portfolioAsset.asset.assetHistoricalPrices[0].closingPrice;
    const usdBrlExchangeRates = await this.getUsdBrlExchangeRates(portfolioAsset.portfolio.buysSells);
    const portfolioAssetCurrentValue = this.adjustAssetCurrentValueByCurrency(portfolioAsset, usdBrlExchangeRates);
    const { profitability, profitabilityInPercentage, totalProfitability, totalProfitabilityInPercentage } =
      this.calculateProfitability(
        portfolioAsset,
        portfolioAssetCurrentValue,
        usdBrlExchangeRates,
        portfolioAsset.portfolio.buysSells
      );

    return {
      id: portfolioAsset.id,
      adjustedCost: portfolioAsset.adjustedCost,
      averageCost: portfolioAsset.averageCost,
      characteristic: portfolioAsset.characteristic,
      cost: portfolioAsset.cost,
      expectedPercentage: portfolioAsset.expectedPercentage,
      payoutsReceived: portfolioAsset.payoutsReceived,
      portfolioId: portfolioAsset.portfolioId,
      position: portfolioAssetCurrentValue,
      profitability,
      profitabilityInPercentage,
      quantity: portfolioAsset.quantity,
      salesTotal: portfolioAsset.salesTotal,
      suggestedBuy: 0,
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
    const { id, assetId, portfolioId, relations, order, withAllAssetPrices } = findPortfolioAssetDto || {};
    const portfolioAsset = await this.portfolioAssetRepository.findOne({
      where: { id, assetId, portfolioId },
      relations: [...(relations || []), 'asset.assetHistoricalPrices'],
      order
    });

    if (!portfolioAsset) {
      throw new NotFoundException('Portfolio asset not found');
    }

    if (!withAllAssetPrices) {
      portfolioAsset.asset.assetHistoricalPrices = [portfolioAsset.asset.assetHistoricalPrices[0]];
    }

    return portfolioAsset;
  }

  public calculateProfitability(
    portfolioAsset: PortfolioAsset,
    assetCurrentValue: number,
    usdBrlExchangeRates: MarketIndexHistoricalData[],
    buysSells: BuySell[]
  ): PortfolioAssetProfitability {
    const unrealizedProfit = this.calculateUnrealizedProfit(portfolioAsset, assetCurrentValue, usdBrlExchangeRates);
    const realizedProfit = this.calculateRealizedProfit(portfolioAsset, buysSells, usdBrlExchangeRates);
    const profit = this.calculateTotalProfit(unrealizedProfit, realizedProfit, portfolioAsset);

    return {
      profitability: unrealizedProfit.value,
      profitabilityInPercentage: unrealizedProfit.value ? unrealizedProfit.value / unrealizedProfit.cost : 0,
      totalProfitability: profit.value,
      totalProfitabilityInPercentage: profit.value ? profit.value / profit.cost : 0
    };
  }

  public adjustAssetCurrentValueByCurrency(
    portfolioAsset: PortfolioAsset,
    usdBrlExchangeRates: MarketIndexHistoricalData[]
  ): number {
    let price = portfolioAsset.asset.assetHistoricalPrices[0]?.closingPrice || 0;
    let quantity = portfolioAsset.quantity;

    if (portfolioAsset.asset?.class === AssetClasses.Cryptocurrency) {
      quantity -= portfolioAsset.fees;
    }

    if (portfolioAsset.asset?.currency === Currencies.USD) {
      const lastUsdBrlExchangeRate = usdBrlExchangeRates[0].value;

      price *= lastUsdBrlExchangeRate;
    }

    return portfolioAsset.quantity * price;
  }

  public calculateUnrealizedProfit(
    portfolioAsset: PortfolioAsset,
    assetAdjustedCurrentValue: number,
    usdBrlExchangeRates: MarketIndexHistoricalData[]
  ): AssetProfit {
    if (!assetAdjustedCurrentValue) {
      return { value: 0, cost: 0 };
    }

    let cost = portfolioAsset.adjustedCost + portfolioAsset.taxes;

    if (portfolioAsset.asset?.class !== AssetClasses.Cryptocurrency) {
      cost += portfolioAsset.fees;
    }

    if (portfolioAsset.asset?.currency === Currencies.USD) {
      const lastUsdBrlExchangeRate = usdBrlExchangeRates[0].value;

      cost *= lastUsdBrlExchangeRate;
    }

    return { value: assetAdjustedCurrentValue - cost, cost };
  }

  public calculateRealizedProfit(
    portfolioAsset: PortfolioAsset,
    buysSells: BuySell[],
    usdBrlExchangeRates: MarketIndexHistoricalData[]
  ): AssetProfit {
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
          const lastUsdBrlExchangeRateBeforeOperation = usdBrlExchangeRates.find(
            (indexData) => new Date(indexData.date) < new Date(operation.date)
          );

          if (operation.type === BuySellTypes.Buy) {
            cost += operation.total * lastUsdBrlExchangeRateBeforeOperation.value;
          } else {
            adjustedSalesTotal += operation.total * lastUsdBrlExchangeRateBeforeOperation.value;
          }
        });
    }

    return { value: adjustedSalesTotal - cost, cost };
  }

  public calculateTotalProfit(
    unrealizedProfit: AssetProfit,
    realizedProfit: AssetProfit,
    portfolioAsset: PortfolioAsset
  ): AssetProfit {
    let adjustedPayoutsReceived = portfolioAsset.payoutsReceived;

    if (portfolioAsset.asset.currency === Currencies.USD) {
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

  private calculateDrop(priceToCompare: number, assetCurrentPrice: number): number {
    return priceToCompare > assetCurrentPrice ? (priceToCompare - assetCurrentPrice) / priceToCompare : 0;
  }
}
