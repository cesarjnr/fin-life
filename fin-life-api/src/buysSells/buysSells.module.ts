import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuysSellsController } from './buysSells.controller';
import { BuySell } from './buySell.entity';
import { CommonModule } from '../common/common.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { AssetsModule } from '../assets/assets.module';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { BuysSellsService } from './buysSells.service';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';

@Module({
  controllers: [BuysSellsController],
  imports: [
    TypeOrmModule.forFeature([BuySell]),
    CommonModule,
    PortfoliosModule,
    AssetsModule,
    PortfoliosAssetsModule,
    AssetHistoricalPricesModule
  ],
  providers: [BuysSellsService]
})
export class BuysSellsModule {}
