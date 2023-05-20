import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Asset } from './asset.entity';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './assets.dto';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    try {
      const { ticker, category, assetClass } = createAssetDto;

      await this.checkIfAssetAlreadyExists(ticker);

      const asset = new Asset(ticker.toUpperCase(), category, assetClass);

      await this.assetsRepository.manager.transaction(async (manager) => {
        await manager.save(asset);
        await this.assetHistoricalPricesService.create(asset, manager);
      });

      return asset;
    } catch (error) {
      throw new InternalServerErrorException('Something wrent wrong. Try again later!');
    }
  }

  public async get(): Promise<Asset[]> {
    return await this.assetsRepository.find();
  }

  public async find(assetId: number): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({ id: assetId });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  private async checkIfAssetAlreadyExists(ticker: string): Promise<void> {
    const asset = await this.assetsRepository.findOne({ ticker: ticker.toUpperCase() });

    if (asset) {
      throw new ConflictException('Asset already exists');
    }
  }
}
