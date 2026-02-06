import { Module } from '@nestjs/common';

import { ContributionsController } from './contributions.controller';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { MarketIndexesModule } from 'src/marketIndexes/marketIndexes.module';
import { ContributionsService } from './contributions.service';

@Module({
  controllers: [ContributionsController],
  imports: [PortfoliosAssetsModule, MarketIndexesModule],
  providers: [ContributionsService]
})
export class ContributionsModule {}
