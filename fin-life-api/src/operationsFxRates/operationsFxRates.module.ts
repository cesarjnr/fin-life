import { Module } from '@nestjs/common';

import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { CommonModule } from '../common/common.module';
import { OperationsFxRatesService } from './operationsFxRates.service';

@Module({
  exports: [OperationsFxRatesService],
  imports: [MarketIndexHistoricalDataModule, CommonModule],
  providers: [OperationsFxRatesService]
})
export class OperationsFxRatesModule {}
