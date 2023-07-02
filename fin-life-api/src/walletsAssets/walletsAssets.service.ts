import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WalletAsset } from './walletAsset.entity';

interface GetWalletsAssetsFilters {
  walletId?: number;
}

@Injectable()
export class WalletsAssetsService {
  constructor(@InjectRepository(WalletAsset) private readonly walletsAssetsRepository: Repository<WalletAsset>) {}

  public async get(filters?: GetWalletsAssetsFilters): Promise<WalletAsset[]> {
    return await this.walletsAssetsRepository.find({ where: { walletId: filters?.walletId } });
  }

  public async find(walletId: number, assetId: number): Promise<WalletAsset> {
    return await this.walletsAssetsRepository.findOne({ where: { walletId, assetId } });
  }
}
