import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuysSellsController } from './buysSells.controller';
import { BuySell } from './buySell.entity';
import { CommonModule } from '../common/common.module';
import { WalletsModule } from '../wallets/wallets.module';
import { AssetsModule } from '../assets/assets.module';
import { WalletsAssetsModule } from '../walletsAssets/walletsAssets.module';
import { BuysSellsService } from './buysSells.service';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';

@Module({
  controllers: [BuysSellsController],
  imports: [
    TypeOrmModule.forFeature([BuySell]),
    CommonModule,
    WalletsModule,
    AssetsModule,
    WalletsAssetsModule,
    AssetHistoricalPricesModule
  ],
  providers: [BuysSellsService]
})
export class BuysSellsModule {}
