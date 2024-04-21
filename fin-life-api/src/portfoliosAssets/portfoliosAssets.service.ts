import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAsset } from './portfolioAsset.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';

interface GetPortfoliosAssetsFilters {
  portfolioId?: number;
}

@Injectable()
export class PortfoliosAssetsService {
  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPriceRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(PortfolioAsset) private readonly portfoliosAssetsRepository: Repository<PortfolioAsset>
  ) {}

  public async get(filters?: GetPortfoliosAssetsFilters): Promise<PortfolioAsset[]> {
    const subQuery = this.assetHistoricalPriceRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      });

    return await this.portfoliosAssetsRepository
      .createQueryBuilder('portfolioAsset')
      .where('portfolioAsset.portfolioId = :portfolioId', { portfolioId: filters?.portfolioId })
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrice',
        `assetHistoricalPrice.id IN (${subQuery.select('id').getQuery()})`
      )
      .orderBy('portfolioAsset.assetId')
      .getMany();
  }

  public async find(portfolioId: number, assetId: number): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsRepository.findOne({ where: { portfolioId, assetId } });
  }
}
