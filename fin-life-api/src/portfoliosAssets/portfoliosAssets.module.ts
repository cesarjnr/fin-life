import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsController } from './portfoliosAssets.controller';
import { PortfolioAsset } from './portfolioAsset.entity';
import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { CommonModule } from '../common/common.module';
import { MarketIndexesModule } from '../marketIndexes/marketIndexes.module';
import { OperationsFxRatesModule } from '../operationsFxRates/operationsFxRates.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';

@Module({
  controllers: [PortfoliosAssetsController],
  exports: [PortfoliosAssetsService],
  imports: [
    TypeOrmModule.forFeature([PortfolioAsset]),
    CommonModule,
    MarketIndexesModule,
    OperationsFxRatesModule,
    AssetHistoricalPricesModule
  ],
  providers: [PortfoliosAssetsService]
})
export class PortfoliosAssetsModule {}
