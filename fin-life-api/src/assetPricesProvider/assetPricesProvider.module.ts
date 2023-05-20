import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AssetPricesProviderService } from './assetPricesProvider.service';

@Module({
  exports: [AssetPricesProviderService],
  imports: [HttpModule],
  providers: [AssetPricesProviderService]
})
export class AssetPricesProviderModule {}
