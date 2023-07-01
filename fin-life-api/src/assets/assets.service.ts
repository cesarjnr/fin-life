import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Asset } from './asset.entity';
import { CreateAssetDto } from './assets.dto';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { ticker, category, assetClass } = createAssetDto;

    await this.checkIfAssetAlreadyExists(ticker);

    const asset = new Asset(ticker.toUpperCase(), category, assetClass);

    await this.assetsRepository.manager.transaction(async (manager) => {
      await manager.save(asset);
      await this.assetHistoricalPricesService.create(asset, manager);
    });

    return asset;
  }

  public async get(): Promise<Asset[]> {
    return await this.assetsRepository.find();
  }

  public async find(assetId: number): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({ where: { id: assetId } });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  private async checkIfAssetAlreadyExists(ticker: string): Promise<void> {
    const asset = await this.assetsRepository.findOne({ where: { ticker: ticker.toUpperCase() } });

    if (asset) {
      throw new ConflictException('Asset already exists');
    }
  }
}
