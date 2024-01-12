import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DividendHistoricalPaymentsController } from './dividendHistoricalPayments.controller';
import { DividendHistoricalPaymentsService } from './dividendHistoricalPayments.service';
import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [DividendHistoricalPaymentsController],
  exports: [DividendHistoricalPaymentsService],
  imports: [TypeOrmModule.forFeature([DividendHistoricalPayment]), CommonModule],
  providers: [DividendHistoricalPaymentsService]
})
export class DividendHistoricalPaymentsModule {}
