import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AssetDataProviderService } from './assetDataProvider.service';

@Module({
  exports: [AssetDataProviderService],
  imports: [HttpModule],
  providers: [AssetDataProviderService]
})
export class AssetDataProviderModule {}
