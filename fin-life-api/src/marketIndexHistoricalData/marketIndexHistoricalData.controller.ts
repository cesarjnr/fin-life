import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { MarketIndexHistoricalDataService } from './marketIndexHistoricalData.service';
import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { GetRequestParams, GetRequestResponse } from '../common/dto/request';

@Controller('market-indexes/:marketIndexId/market-index-historical-data')
export class MarketIndexHistoricalDataController {
  constructor(private marketIndexHistoricalDataService: MarketIndexHistoricalDataService) {}

  @Get()
  public async get(
    @Param('marketIndexId', ParseIntPipe) marketIndexId: number,
    @Query() params: GetRequestParams
  ): Promise<GetRequestResponse<MarketIndexHistoricalData>> {
    return await this.marketIndexHistoricalDataService.get({ marketIndexId, ...params });
  }
}
