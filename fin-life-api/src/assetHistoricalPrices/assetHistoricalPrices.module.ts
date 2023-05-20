import { Module } from '@nestjs/common';

import { AssetPricesProviderModule } from '../assetPricesProvider/assetPricesProvider.module';
import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';

@Module({
  exports: [AssetHistoricalPricesService],
  imports: [AssetPricesProviderModule],
  providers: [AssetHistoricalPricesService]
})
export class AssetHistoricalPricesModule {}
