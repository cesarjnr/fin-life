import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsController } from './portfoliosAssets.controller';
import { PortfolioAsset } from './portfolioAsset.entity';
import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { MarketIndexesModule } from '../marketIndexes/marketIndexes.module';
import { OperationsFxRatesModule } from '../operationsFxRates/operationsFxRates.module';

@Module({
  controllers: [PortfoliosAssetsController],
  exports: [PortfoliosAssetsService],
  imports: [TypeOrmModule.forFeature([PortfolioAsset]), MarketIndexesModule, OperationsFxRatesModule],
  providers: [PortfoliosAssetsService]
})
export class PortfoliosAssetsModule {}
