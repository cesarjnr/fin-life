import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';
import { UpdatePortfolioDto } from './portfolios-assets.dto';
import { BuysSellsService } from 'src/buysSells/buysSells.service';
import { BuySell } from 'src/buysSells/buySell.entity';

interface GetPortfoliosAssetsParams {
  portfolioId?: number;
}
interface FindPortfolioAssetParams {
  assetId: number;
  portfolioId: number;
  order?: {
    asset?: {
      assetHistoricalPrices?: {
        date: 'ASC' | 'DESC';
      };
    };
  };
  withAllAssetPrices?: boolean;
}

@Injectable()
export class PortfoliosAssetsService {
  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPriceRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(PortfolioAsset) private readonly portfolioAssetRepository: Repository<PortfolioAsset>
  ) {}

  public async get(filters?: GetPortfoliosAssetsParams): Promise<PortfolioAsset[]> {
    const subQuery = this.assetHistoricalPriceRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      });

    return await this.portfolioAssetRepository
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
    const portfolioAsset = await this.find({ assetId, portfolioId });
    const updatedPortfolioAsset = this.portfolioAssetRepository.merge(
      Object.assign({}, portfolioAsset),
      updatePortfolioAssetDto
    );

    await this.portfolioAssetRepository.save(updatedPortfolioAsset);

    return updatedPortfolioAsset;
  }

  public async delete(assetId: number, portfolioId: number): Promise<void> {
    await this.find({ assetId, portfolioId });
    await this.portfolioAssetRepository.manager.transaction(async (entityManager) => {
      await entityManager.delete(BuySell, { assetId, portfolioId });
      await entityManager.delete(PortfolioAsset, { assetId, portfolioId });
    });
  }

  public async find(params: FindPortfolioAssetParams): Promise<PortfolioAsset> {
    const { assetId, portfolioId, order, withAllAssetPrices } = params;
    const portfolioAsset = await this.portfolioAssetRepository.findOne({
      where: { assetId, portfolioId },
      relations: ['asset.assetHistoricalPrices'],
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
}
