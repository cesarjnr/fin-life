import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { GetSplitHistoricalEventsDto, SplitHistoricalEventsService } from './splitHistoricalEvents.service';
import { PaginationResponse } from '../common/dto/pagination';
import { SplitHistoricalEvent } from './splitHistoricalEvent.entity';

@Controller('assets/:assetId/split-historical-events')
export class SplitHistoricalEventsController {
  constructor(private splitHistoricalEventsService: SplitHistoricalEventsService) {}

  @Get()
  public async get(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() getSplitHistoricalEventsDto: GetSplitHistoricalEventsDto
  ): Promise<PaginationResponse<SplitHistoricalEvent>> {
    return await this.splitHistoricalEventsService.get(assetId, getSplitHistoricalEventsDto);
  }
}
