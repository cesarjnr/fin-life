import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WalletAsset } from './walletAsset.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';

interface GetWalletsAssetsFilters {
  walletId?: number;
}

@Injectable()
export class WalletsAssetsService {
  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPriceRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(WalletAsset) private readonly walletsAssetsRepository: Repository<WalletAsset>
  ) {}

  public async get(filters?: GetWalletsAssetsFilters): Promise<WalletAsset[]> {
    const subQuery = this.assetHistoricalPriceRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      });

    return await this.walletsAssetsRepository
      .createQueryBuilder('walletAsset')
      .where('walletAsset.walletId = :walletId', { walletId: filters?.walletId })
      .leftJoinAndSelect('walletAsset.asset', 'asset')
      .leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrice',
        `assetHistoricalPrice.id IN (${subQuery.select('id').getQuery()})`
      )
      .orderBy('walletAsset.assetId')
      .getMany();
  }

  public async find(walletId: number, assetId: number): Promise<WalletAsset> {
    return await this.walletsAssetsRepository.findOne({ where: { walletId, assetId } });
  }
}
