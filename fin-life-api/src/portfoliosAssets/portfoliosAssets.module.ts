import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsController } from './portfoliosAssets.controller';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from './portfolio-asset.entity';
import { PortfoliosAssetsService } from './portfoliosAssets.service';

@Module({
  controllers: [PortfoliosAssetsController],
  exports: [PortfoliosAssetsService],
  imports: [TypeOrmModule.forFeature([AssetHistoricalPrice, PortfolioAsset])],
  providers: [PortfoliosAssetsService]
})
export class PortfoliosAssetsModule {}
