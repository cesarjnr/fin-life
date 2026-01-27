import { Module } from '@nestjs/common';

import { ContributionsController } from './contributions.controller';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { ContributionsService } from './contributions.service';

@Module({
  controllers: [ContributionsController],
  imports: [PortfoliosAssetsModule, MarketIndexHistoricalDataModule],
  providers: [ContributionsService]
})
export class ContributionsModule {}
