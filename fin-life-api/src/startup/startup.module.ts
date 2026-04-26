import { Module } from '@nestjs/common';

import { StartupService } from './startup.service';
import { MarketIndexesModule } from '../marketIndexes/marketIndexes.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [MarketIndexesModule, AssetsModule],
  providers: [StartupService]
})
export class StartupModule {}
