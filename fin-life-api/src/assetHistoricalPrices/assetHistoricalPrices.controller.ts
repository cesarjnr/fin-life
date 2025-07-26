import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Query } from '@nestjs/common';

import { AssetHistoricalPricesService } from './assetHistoricalPrices.service';
import { GetRequestParams, GetRequestResponse } from '../common/dto/request';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';

@Controller('assets/:assetId/asset-historical-prices')
export class AssetHistoricalPricesController {
  constructor(private assetHistoricalPricesService: AssetHistoricalPricesService) {}

  @Get()
  public async get(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() params: GetRequestParams
  ): Promise<GetRequestResponse<AssetHistoricalPrice>> {
    return await this.assetHistoricalPricesService.get(assetId, params);
  }

  @Delete()
  @HttpCode(204)
  public async delete(@Param('assetId', ParseIntPipe) assetId: number): Promise<void> {
    return await this.assetHistoricalPricesService.delete(assetId);
  }
}
