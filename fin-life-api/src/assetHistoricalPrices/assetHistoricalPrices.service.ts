import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ModuleRef } from '@nestjs/core';

import { AssetsService } from '../assets/assets.service';
import { AssetPrices, AssetPricesProviderService } from '../assetPricesProvider/assetPricesProvider.service';
import { Asset } from '../assets/asset.entity';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';

interface GetAssetHistoricalPricesFilters {
  assetIds?: number[];
  date?: string;
}

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);
  private assetsService: AssetsService;

  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPricesRepository: Repository<AssetHistoricalPrice>,
    @Inject(AssetPricesProviderService) private readonly assetPricesProviderService: AssetPricesProviderService,
    private moduleRef: ModuleRef
  ) {}

  public async create(asset: Asset, manager: EntityManager): Promise<void> {
    const assetPrices = await this.assetPricesProviderService.find(asset.ticker);
    const assetHistoricalPrices = this.createAssetHistoricalPrices(asset, assetPrices);

    await manager.save(assetHistoricalPrices);
  }

  public async getMostRecentsBeforeDate(assetIds: number[], beforeDate: string): Promise<AssetHistoricalPrice[]> {
    return await this.assetHistoricalPricesRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy('assetHistoricalPrice.assetId', 'DESC')
      .where('assetHistoricalPrice.assetId IN (:...assetIds)', { assetIds })
      .andWhere('assetHistoricalPrice.date <= :beforeDate', { beforeDate })
      .getMany();
  }

  @Cron(CronExpression.EVERY_DAY_AT_9PM, { name: 'createPricesOfTheDay' })
  public async createPricesOfTheDay(): Promise<void> {
    this.assetsService = this.moduleRef.get(AssetsService, { strict: false });

    const assets = await this.assetsService.get();
    const fromToday = new Date();
    const assetHistoricalPrices: AssetHistoricalPrice[] = [];

    for (const asset of assets) {
      const assetPrices = await this.assetPricesProviderService.find(asset.ticker, fromToday);

      assetHistoricalPrices.push(...this.createAssetHistoricalPrices(asset, assetPrices));
    }

    await this.assetHistoricalPricesRepository.save(assetHistoricalPrices);
  }

  private createAssetHistoricalPrices(asset: Asset, assetPrices: AssetPrices): AssetHistoricalPrice[] {
    return assetPrices.prices.map((assetPrice) => {
      const splitCoefficient = assetPrice.splitCoefficient > 1 ? assetPrice.splitCoefficient : undefined;

      return new AssetHistoricalPrice(asset.id, assetPrice.date, assetPrice.closing, splitCoefficient);
    });
  }
}
