import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import {
  AssetProfitability,
  GetPortfolioAssetProfitabilityParams,
  ProfitabilitiesService
} from './profitabilities.service';

@Controller('users/:userId/portfolios/:portfolioId/profitabilities')
export class ProfitabilitiesController {
  constructor(private readonly profitabilitiesService: ProfitabilitiesService) {}

  @Get('assets/:assetId')
  public async getPortfolioAssetProfitability(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() params: Pick<GetPortfolioAssetProfitabilityParams, 'includeIndexes'>
  ): Promise<AssetProfitability> {
    const { includeIndexes } = params;
    return await this.profitabilitiesService.getPortfolioAssetProfitability({
      assetId,
      portfolioId,
      includeIndexes: Array.isArray(includeIndexes) ? includeIndexes : [includeIndexes]
    });
  }
}
