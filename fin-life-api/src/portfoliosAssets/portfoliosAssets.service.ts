import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';
import { GetPortfolioAssetMetricsDto, UpdatePortfolioDto } from './portfoliosAssets.dto';
import { BuySell } from '../buysSells/buySell.entity';

interface GetPortfoliosAssetsDto {
  portfolioId?: number;
}
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

@Injectable()
export class PortfoliosAssetsService {
  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPriceRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(PortfolioAsset) private readonly portfolioAssetRepository: Repository<PortfolioAsset>
  ) {}

  public async get(getPortfolioAssetsDto?: GetPortfoliosAssetsDto): Promise<PortfolioAsset[]> {
    const subQuery = this.assetHistoricalPriceRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      });

    return await this.portfolioAssetRepository
      .createQueryBuilder('portfolioAsset')
      .where('portfolioAsset.portfolioId = :portfolioId', { portfolioId: getPortfolioAssetsDto?.portfolioId })
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrice',
        `assetHistoricalPrice.id IN (${subQuery.select('id').getQuery()})`
      )
      .orderBy('portfolioAsset.assetId')
      .getMany();
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
      order: { asset: { assetHistoricalPrices: { date: 'DESC' } } }
    });
    const assetCurrentPrice = portfolioAsset.asset.assetHistoricalPrices[0].closingPrice;
    const portfolioAssetCurrentValue = portfolioAsset.quantity * assetCurrentPrice;
    const { profitability, profitabilityInPercentage, totalProfitability, totalProfitabilityInPercentage } =
      this.calculateProfitability(portfolioAsset, portfolioAssetCurrentValue);

    return {
      id: portfolioAsset.id,
      adjustedCost: portfolioAsset.adjustedCost,
      averageCost: portfolioAsset.averageCost,
      characteristic: portfolioAsset.characteristic,
      cost: portfolioAsset.cost,
      expectedPercentage: portfolioAsset.expectedPercentage,
      dividends: portfolioAsset.dividendsPaid,
      portfolioId: portfolioAsset.portfolioId,
      position: portfolioAssetCurrentValue,
      profitability,
      profitabilityInPercentage,
      quantity: portfolioAsset.quantity,
      salesTotal: portfolioAsset.salesTotal,
      suggestedBuy: 0,
      totalProfitability,
      totalProfitabilityInPercentage,
      yieldOnCost: portfolioAsset.dividendsPaid / portfolioAsset.adjustedCost,
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

  public async find(findPortfolioAssetDto: FindPortfolioAssetDto): Promise<PortfolioAsset> {
    const { id, assetId, portfolioId, relations, order, withAllAssetPrices } = findPortfolioAssetDto;
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

  private calculateProfitability(
    portfolioAsset: PortfolioAsset,
    portfolioAssetCurrentValue: number
  ): PortfolioAssetProfitability {
    const profitability = portfolioAssetCurrentValue - portfolioAsset.adjustedCost;
    const profitabilityInPercentage = profitability / portfolioAsset.adjustedCost;
    const totalProfitability = profitability + portfolioAsset.salesTotal + portfolioAsset.dividendsPaid;
    const totalProfitabilityInPercentage = totalProfitability / portfolioAsset.adjustedCost;

    return {
      profitability,
      profitabilityInPercentage,
      totalProfitability,
      totalProfitabilityInPercentage
    };
  }

  private calculateDrop(priceToCompare: number, assetCurrentPrice: number): number {
    return priceToCompare > assetCurrentPrice ? (priceToCompare - assetCurrentPrice) / priceToCompare : 0;
  }
}
