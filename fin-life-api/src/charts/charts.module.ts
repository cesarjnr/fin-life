import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChartsController } from './charts.controller';
import { PortfolioAssetEvent } from '../portfoliosAssetsEvents/portfolioAssetEvent.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { CommonModule } from '../common/common.module';
import { OperationsModule } from '../operations/operations.module';
import { ChartsService } from './charts.service';
import { AssetsModule } from '../assets/assets.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';

@Module({
  controllers: [ChartsController],
  imports: [
    TypeOrmModule.forFeature([PortfolioAssetEvent, PortfolioAsset]),
    CommonModule,
    OperationsModule,
    AssetsModule,
    AssetHistoricalPricesModule
  ],
  providers: [ChartsService]
})
export class ChartsModule {}
