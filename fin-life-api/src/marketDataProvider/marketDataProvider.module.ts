import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { MarketDataProviderService } from './marketDataProvider.service';
import { CommonModule } from '../common/common.module';

@Module({
  exports: [MarketDataProviderService],
  imports: [HttpModule, CommonModule],
  providers: [MarketDataProviderService]
})
export class MarketDataProviderModule {}
