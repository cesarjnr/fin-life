import { Module } from '@nestjs/common';

import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { CommonModule } from '../common/common.module';
import { OperationsFxRatesService } from './operationsFxRates.service';
import { MarketIndexesModule } from 'src/marketIndexes/marketIndexes.module';

@Module({
  exports: [OperationsFxRatesService],
  imports: [MarketIndexHistoricalDataModule, CommonModule, MarketIndexesModule],
  providers: [OperationsFxRatesService]
})
export class OperationsFxRatesModule {}
