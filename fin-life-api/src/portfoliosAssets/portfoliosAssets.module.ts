import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsController } from './portfoliosAssets.controller';
import { PortfolioAsset } from './portfolioAsset.entity';
import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { CommonModule } from '../common/common.module';
import { MarketIndexesModule } from '../marketIndexes/marketIndexes.module';
import { OperationsFxRatesModule } from '../operationsFxRates/operationsFxRates.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { PortfolioAssetOwnershipGuard } from './portfolio-asset-ownership.guard';

@Module({
  controllers: [PortfoliosAssetsController],
  exports: [PortfoliosAssetsService, PortfolioAssetOwnershipGuard],
  imports: [
    TypeOrmModule.forFeature([PortfolioAsset]),
    CommonModule,
    MarketIndexesModule,
    OperationsFxRatesModule,
    AssetHistoricalPricesModule,
    PortfoliosModule
  ],
  providers: [PortfoliosAssetsService, PortfolioAssetOwnershipGuard]
})
export class PortfoliosAssetsModule {}
