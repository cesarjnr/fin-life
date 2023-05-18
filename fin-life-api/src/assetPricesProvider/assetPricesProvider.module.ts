import { Module } from '@nestjs/common';
import { AssetPricesProviderService } from './assetPricesProvider.service';

@Module({
  exports: [AssetPricesProviderService],
  providers: [AssetPricesProviderService]
})
export class AssetPricesProviderModule {}
