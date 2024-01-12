import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { DividendHistoricalPaymentsService } from './dividendHistoricalPayments.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';
import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';

@Controller('assets/:assetId/dividend-historical-payments')
export class DividendHistoricalPaymentsController {
  constructor(private dividendHistoricalPaymentsService: DividendHistoricalPaymentsService) {}

  @Get()
  public async get(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() params: PaginationParams
  ): Promise<PaginationResponse<DividendHistoricalPayment>> {
    return await this.dividendHistoricalPaymentsService.get(assetId, params);
  }
}
