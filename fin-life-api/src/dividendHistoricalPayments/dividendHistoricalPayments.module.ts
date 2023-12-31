import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DividendHistoricalPaymentsService } from './dividendHistoricalPayments.service';
import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';
import { CommonModule } from '../common/common.module';

@Module({
  exports: [DividendHistoricalPaymentsService],
  imports: [TypeOrmModule.forFeature([DividendHistoricalPayment]), CommonModule],
  providers: [DividendHistoricalPaymentsService]
})
export class DividendHistoricalPaymentsModule {}
