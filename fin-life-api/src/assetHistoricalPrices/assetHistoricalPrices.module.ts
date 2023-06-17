import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { AssetPricesProviderModule } from '../assetPricesProvider/assetPricesProvider.module';

@Module({
  exports: [AssetHistoricalPricesService],
  imports: [TypeOrmModule.forFeature([AssetHistoricalPrice]), AssetPricesProviderModule],
  providers: [AssetHistoricalPricesService]
})
export class AssetHistoricalPricesModule {}
