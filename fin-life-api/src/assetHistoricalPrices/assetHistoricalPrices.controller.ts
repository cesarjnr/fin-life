import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';

@Controller('assets/:assetId/asset-historical-prices')
export class AssetHistoricalPricesController {
  constructor(private assetHistoricalPricesService: AssetHistoricalPricesService) {}

  @Get()
  public async get(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() params: PaginationParams
  ): Promise<PaginationResponse<AssetHistoricalPrice>> {
    return await this.assetHistoricalPricesService.get(assetId, params);
  }
}
