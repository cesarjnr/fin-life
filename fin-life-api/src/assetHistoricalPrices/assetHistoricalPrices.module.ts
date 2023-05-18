import { Module } from '@nestjs/common';

import { AssetsModule } from '../assets/assets.module';
import { AssetPricesProviderModule } from '../assetPricesProvider/assetPricesProvider.module';
import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';

@Module({
  imports: [AssetsModule, AssetPricesProviderModule],
  providers: [AssetHistoricalPricesService]
})
export class AssetHistoricalPricesModule {}
