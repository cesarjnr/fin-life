import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { MarketIndexesService } from '../marketIndexes/marketIndexes.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupService.name);

  constructor(
    private readonly marketIndexesService: MarketIndexesService,
    private readonly assetsService: AssetsService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('[onApplicationBootstrap] Running startup data synchronization...');

    try {
      await this.marketIndexesService.syncData();

      this.logger.log(
        '[onApplicationBootstrap] Market indexes data synchronized. Starting asset prices synchronization...'
      );

      await this.assetsService.syncPrices();

      this.logger.log('[onApplicationBootstrap] Startup data synchronization completed successfully');
    } catch (error) {
      this.logger.error(`[onApplicationBootstrap] Startup data synchronization failed: ${error.message}`, error.stack);
    }
  }
}
