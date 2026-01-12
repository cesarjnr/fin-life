import { Module } from '@nestjs/common';

import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { CommonModule } from '../common/common.module';
import { OperationsExchangeRatesService } from './operationsExchangeRates.service';

@Module({
  exports: [OperationsExchangeRatesService],
  imports: [MarketIndexHistoricalDataModule, CommonModule],
  providers: [OperationsExchangeRatesService]
})
export class OperationsExchangeRatesModule {}
