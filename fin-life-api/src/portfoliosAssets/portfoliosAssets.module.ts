import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsController } from './portfoliosAssets.controller';
import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolioAsset.entity';

@Module({
  controllers: [PortfoliosAssetsController],
  exports: [PortfoliosAssetsService],
  imports: [TypeOrmModule.forFeature([AssetHistoricalPrice, PortfolioAsset])],
  providers: [PortfoliosAssetsService]
})
export class PortfoliosAssetsModule {}
