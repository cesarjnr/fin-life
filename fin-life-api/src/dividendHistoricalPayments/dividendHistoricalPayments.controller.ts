import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import {
  DividendHistoricalPaymentsService,
  GetDividendHistoricalPaymentsDto
} from './dividendHistoricalPayments.service';
import { GetRequestResponse } from '../common/dto/request';
import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';

@Controller('assets/:assetId/dividend-historical-payments')
export class DividendHistoricalPaymentsController {
  constructor(private dividendHistoricalPaymentsService: DividendHistoricalPaymentsService) {}

  @Get()
  public async get(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() getDividendHistoricalPaymentsDto: GetDividendHistoricalPaymentsDto
  ): Promise<GetRequestResponse<DividendHistoricalPayment>> {
    return await this.dividendHistoricalPaymentsService.get(assetId, getDividendHistoricalPaymentsDto);
  }
}
