import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsPayoutsController } from './portfoliosAssetsPayouts.controller';
import { PortfolioAssetPayout } from './portfolioAssetPayout.entity';
import { CommonModule } from '../common/common.module';
import { FilesModule } from '../files/files.module';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { PortfoliosAssetsPayoutsService } from './portfoliosAssetsPayouts.service';

@Module({
  controllers: [PortfoliosAssetsPayoutsController],
  imports: [
    TypeOrmModule.forFeature([PortfolioAssetPayout]),
    CommonModule,
    FilesModule,
    MarketIndexHistoricalDataModule,
    PortfoliosAssetsModule
  ],
  providers: [PortfoliosAssetsPayoutsService]
})
export class PortfoliosAssetsPayoutsModule {}
