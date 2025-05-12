import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Asset } from './asset.entity';
import { CreateAssetDto, UpdateAssetDto } from './assets.dto';
import { AssetData, MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
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
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly dividendHistoricalPaymentsService: DividendHistoricalPaymentsService,
    private readonly splitHistoricalEventsService: SplitHistoricalEventsService
  ) {}

  public async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { ticker, category, assetClass, sector, currency } = createAssetDto;

    await this.checkIfAssetAlreadyExists(ticker);

    return await this.assetsRepository.manager.transaction(async (manager) => {
      const assetData = await this.marketDataProviderService.getAssetHistoricalData(`${ticker}.SA`, undefined, true);
      const allTimeHighPrice = this.findAllTimeHighPrice(assetData);
      const asset = new Asset(ticker.toUpperCase(), category, assetClass, sector, allTimeHighPrice, currency);

      await manager.save(asset);
      await this.assetHistoricalPricesService.create(asset, assetData.prices, manager);
      await this.dividendHistoricalPaymentsService.create(asset, assetData.dividends, manager);
      await this.splitHistoricalEventsService.create(asset, assetData.splits, manager);

      return asset;
    });
  }

  public async get(params?: GetAssetsParams): Promise<Asset[]> {
    const where: FindOptionsWhere<Asset> = {};

    if (params?.active) {
      where.active = params.active === 'true';
    }

    return await this.assetsRepository.find({ where, order: { class: 'ASC', ticker: 'ASC' } });
  }

  public async update(assetId: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.find(assetId);
    const updatedAsset = this.assetsRepository.merge({ ...asset }, updateAssetDto);

    await this.assetsRepository.save(updatedAsset);

    return updatedAsset;
  }

  public async find(assetId: number, params?: FindAssetParams): Promise<Asset> {
    const { relations } = params || {};
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

  private findAllTimeHighPrice(assetData: AssetData): number {
    let allTimeHighPrice = 0;

    assetData.prices.forEach((price) => {
      if (price.high > allTimeHighPrice) {
        allTimeHighPrice = price.high;
      }
    });

    return allTimeHighPrice;
  }
}
