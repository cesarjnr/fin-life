import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EntityManager } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AssetsService } from '../assets/assets.service';
import { AssetPricesProviderService } from '../assetPricesProvider/assetPricesProvider.service';
import { Asset } from '../assets/asset.entity';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);
  private assetsService: AssetsService;

  constructor(
    /* @Inject(AssetsService) private readonly assetsService: AssetsService, */
    @Inject(AssetPricesProviderService) private readonly assetPricesProviderService: AssetPricesProviderService,
    private moduleRef: ModuleRef
  ) {}

  public async create(asset: Asset, manager: EntityManager): Promise<void> {
    const assetPrices = await this.assetPricesProviderService.find(asset.ticker);
    const assetHistoricalPrices: AssetHistoricalPrice[] = assetPrices.prices.map(
      (assetPrice) => new AssetHistoricalPrice(asset.id, new Date(assetPrice.date), assetPrice.closing)
    );

    await manager.save(assetHistoricalPrices);
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  public async createPricesOfTheDay(): Promise<void> {
    this.assetsService = this.moduleRef.get(AssetsService, { strict: false });

    // const assets = await this.assetsService.get();
    // const fromToday = new Date();

    // for (const asset of assets) {
    //   const assetPrices = await this.assetPricesProviderService.find(asset.ticker, fromToday);
    // }
  }
}
