import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AssetDataProviderService } from './assetDataProvider.service';
import { CommonModule } from '../common/common.module';

@Module({
  exports: [AssetDataProviderService],
  imports: [HttpModule, CommonModule],
  providers: [AssetDataProviderService]
})
export class AssetDataProviderModule {}
