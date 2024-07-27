import { Body, Controller, Get, Post } from '@nestjs/common';

import { MarketIndexHistoricalDataService } from './marketIndexHistoricalData.service';
import { CreateMarketIndexHistoricalDataDto, MarketIndexOverview } from './marketIndexHistoricalData.dto';

@Controller('market-index-historical-data')
export class MarketIndexHistoricalDataController {
  constructor(private marketIndexHistoricalDataService: MarketIndexHistoricalDataService) {}

  @Post()
  public async create(@Body() createMarketIndexHistoricalDataDto: CreateMarketIndexHistoricalDataDto): Promise<void> {
    return await this.marketIndexHistoricalDataService.create(createMarketIndexHistoricalDataDto);
  }

  @Get('overview')
  public async getMarketIndexesOverview(): Promise<MarketIndexOverview[]> {
    return await this.marketIndexHistoricalDataService.getMarketIndexesOverview();
  }
}
