import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuysSellsController } from './buysSells.controller';
import { BuysSellsService } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CommonModule } from '../common/common.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { AssetsModule } from '../assets/assets.module';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [BuysSellsController],
  exports: [BuysSellsService],
  imports: [
    TypeOrmModule.forFeature([BuySell]),
    CommonModule,
    PortfoliosModule,
    AssetsModule,
    PortfoliosAssetsModule,
    AssetHistoricalPricesModule,
    FilesModule
  ],
  providers: [BuysSellsService]
})
export class BuysSellsModule {}
