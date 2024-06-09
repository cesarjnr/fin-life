import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';
import { UpdatePortfolioDto } from './portfolios-assets.dto';

interface GetPortfoliosAssetsParams {
  portfolioId?: number;
}

@Injectable()
export class PortfoliosAssetsService {
  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPriceRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(PortfolioAsset) private readonly portfoliosAssetsRepository: Repository<PortfolioAsset>
  ) {}

  public async get(filters?: GetPortfoliosAssetsParams): Promise<PortfolioAsset[]> {
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

  public async update(
    assetId: number,
    portfolioId: number,
    updatePortfolioAssetDto: UpdatePortfolioDto
  ): Promise<PortfolioAsset> {
    const portfolioAsset = await this.find(assetId, portfolioId);
    const updatedPortfolioAsset = this.portfoliosAssetsRepository.merge(
      Object.assign({}, portfolioAsset),
      updatePortfolioAssetDto
    );

    await this.portfoliosAssetsRepository.save(updatedPortfolioAsset);

    return updatedPortfolioAsset;
  }

  public async find(assetId: number, portfolioId: number, withAllAssetPrices?: boolean): Promise<PortfolioAsset> {
    const portfolioAsset = await this.portfoliosAssetsRepository.findOne({
      where: { assetId, portfolioId },
      relations: ['asset.assetHistoricalPrices'],
      order: {
        asset: {
          assetHistoricalPrices: {
            date: 'DESC'
          }
        }
      }
    });

    if (!portfolioAsset) {
      throw new NotFoundException('Asset not found');
    }

    if (!withAllAssetPrices) {
      portfolioAsset.asset.assetHistoricalPrices = [portfolioAsset.asset.assetHistoricalPrices[0]];
    }

    return portfolioAsset;
  }
}
