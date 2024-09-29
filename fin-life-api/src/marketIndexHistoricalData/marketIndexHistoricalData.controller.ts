import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MarketIndexHistoricalDataService } from './marketIndexHistoricalData.service';
import {
  CreateMarketIndexHistoricalDataDto,
  GetMarketIndexHistoricalDataDto,
  MarketIndexOverview
} from './marketIndexHistoricalData.dto';
import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { PaginationResponse } from '../common/dto/pagination';

@Controller('market-index-historical-data')
export class MarketIndexHistoricalDataController {
  constructor(private marketIndexHistoricalDataService: MarketIndexHistoricalDataService) {}

  @Post()
  public async create(@Body() createMarketIndexHistoricalDataDto: CreateMarketIndexHistoricalDataDto): Promise<void> {
    return await this.marketIndexHistoricalDataService.create(createMarketIndexHistoricalDataDto);
  }

  @Get()
  public async get(
    @Query() getMarketIndexHistoricalDataDto: GetMarketIndexHistoricalDataDto
  ): Promise<PaginationResponse<MarketIndexHistoricalData>> {
    return await this.marketIndexHistoricalDataService.get(getMarketIndexHistoricalDataDto);
  }

  @Get('overview')
  public async getMarketIndexesOverview(): Promise<MarketIndexOverview[]> {
    return await this.marketIndexHistoricalDataService.getMarketIndexesOverview();
  }
}
