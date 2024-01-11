import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Asset } from './asset.entity';
import { CreateAssetDto } from './assets.dto';
import { AssetDataProviderService } from '../assetDataProvider/assetDataProvider.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { DividendHistoricalPaymentsService } from '../dividendHistoricalPayments/dividendHistoricalPayments.service';
import { SplitHistoricalEventsService } from '../splitHistoricalEvents/splitHistoricalEvents.service';

export interface GetAssetsParams {
  active?: string;
}
export interface FindAssetParams {
  relations?: string[];
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly assetProviderDataService: AssetDataProviderService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly dividendHistoricalPaymentsService: DividendHistoricalPaymentsService,
    private readonly splitHistoricalEventsService: SplitHistoricalEventsService
  ) {}

  public async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { ticker, category, assetClass, sector } = createAssetDto;

    await this.checkIfAssetAlreadyExists(ticker);

    const asset = new Asset(ticker.toUpperCase(), category, assetClass, sector);

    await this.assetsRepository.manager.transaction(async (manager) => {
      const assetData = await this.assetProviderDataService.find(asset.ticker, undefined, true);

      await manager.save(asset);
      await this.assetHistoricalPricesService.create(asset, assetData.prices, manager);
      await this.dividendHistoricalPaymentsService.create(asset, assetData.dividends, manager);
      await this.splitHistoricalEventsService.create(asset, assetData.splits, manager);
    });

    return asset;
  }

  public async get(params?: GetAssetsParams): Promise<Asset[]> {
    const where: FindOptionsWhere<Asset> = {};

    if (params?.active) {
      where.active = params.active === 'true';
    }

    return await this.assetsRepository.find({ where });
  }

  public async find(assetId: number, params?: FindAssetParams): Promise<Asset> {
    const { relations } = params;
    const asset = await this.assetsRepository.findOne({
      where: { id: assetId },
      relations: relations ? (Array.isArray(relations) ? relations : [relations]) : []
    });

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
