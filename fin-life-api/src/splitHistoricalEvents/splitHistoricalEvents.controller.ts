import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { SplitHistoricalEventsService } from './splitHistoricalEvents.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';
import { SplitHistoricalEvent } from './splitHistoricalEvent.entity';

@Controller('assets/:assetId/split-historical-events')
export class SplitHistoricalEventsController {
  constructor(private splitHistoricalEventsService: SplitHistoricalEventsService) {}

  @Get()
  public async get(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() params: PaginationParams
  ): Promise<PaginationResponse<SplitHistoricalEvent>> {
    return await this.splitHistoricalEventsService.get(assetId, params);
  }
}
