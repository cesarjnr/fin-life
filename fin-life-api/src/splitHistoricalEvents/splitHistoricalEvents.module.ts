import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SplitHistoricalEventsController } from './splitHistoricalEvents.controller';
import { SplitHistoricalEventsService } from './splitHistoricalEvents.service';
import { SplitHistoricalEvent } from './splitHistoricalEvent.entity';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [SplitHistoricalEventsController],
  exports: [SplitHistoricalEventsService],
  imports: [TypeOrmModule.forFeature([SplitHistoricalEvent]), CommonModule],
  providers: [SplitHistoricalEventsService]
})
export class SplitHistoricalEventsModule {}
