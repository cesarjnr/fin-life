import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsController } from './portfoliosAssets.controller';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';
import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { OperationsExchangeRatesModule } from '../operationsExchangeRates/operationsExchangeRates.module';

@Module({
  controllers: [PortfoliosAssetsController],
  exports: [PortfoliosAssetsService],
  imports: [TypeOrmModule.forFeature([PortfolioAsset]), MarketIndexHistoricalDataModule, OperationsExchangeRatesModule],
  providers: [PortfoliosAssetsService]
})
export class PortfoliosAssetsModule {}
