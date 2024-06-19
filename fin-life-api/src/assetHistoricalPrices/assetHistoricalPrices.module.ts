import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetHistoricalPricesController } from './assetHistoricalPrices.controller';
import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { Asset } from '../assets/asset.entity';
import { CommonModule } from '../common/common.module';
import { AssetDataProviderModule } from '../assetDataProvider/assetDataProvider.module';

@Module({
  controllers: [AssetHistoricalPricesController],
  exports: [AssetHistoricalPricesService],
  imports: [TypeOrmModule.forFeature([AssetHistoricalPrice, Asset]), CommonModule, AssetDataProviderModule],
  providers: [AssetHistoricalPricesService]
})
export class AssetHistoricalPricesModule {}
