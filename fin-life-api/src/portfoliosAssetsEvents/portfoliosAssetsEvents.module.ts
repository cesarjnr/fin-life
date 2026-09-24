import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsEventsController } from './portfoliosAssetsEvents.controller';
import { PortfolioAssetEvent } from './portfolioAssetEvent.entity';
import { CommonModule } from '../common/common.module';
import { FilesModule } from '../files/files.module';
import { MarketIndexesModule } from '../marketIndexes/marketIndexes.module';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { PortfoliosAssetsEventsService } from './portfoliosAssetsEvents.service';

@Module({
  controllers: [PortfoliosAssetsEventsController],
  imports: [
    TypeOrmModule.forFeature([PortfolioAssetEvent]),
    CommonModule,
    FilesModule,
    MarketIndexesModule,
    MarketIndexHistoricalDataModule,
    PortfoliosAssetsModule
  ],
  providers: [PortfoliosAssetsEventsService]
})
export class PortfoliosAssetsEventsModule {}
