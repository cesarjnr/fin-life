import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetHistoricalPricesController } from './assetHistoricalPrices.controller';
import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [AssetHistoricalPricesController],
  exports: [AssetHistoricalPricesService],
  imports: [TypeOrmModule.forFeature([AssetHistoricalPrice]), CommonModule],
  providers: [AssetHistoricalPricesService]
})
export class AssetHistoricalPricesModule {}
