import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AssetsService } from '../assets/assets.service';
import { AssetPricesProviderService } from '../assetPricesProvider/assetPricesProvider.service';

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);

  constructor(
    @Inject(AssetsService) private readonly assetsService: AssetsService,
    @Inject(AssetPricesProviderService) private readonly assetPricesProviderService: AssetPricesProviderService
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  public async create(): Promise<void> {
    const assets = await this.assetsService.get();
    const fromToday = new Date();

    // for (const asset of assets) {
    //   const assetPrices = await this.assetPricesProviderService.find(asset.ticker, fromToday);
    // }
  }
}
