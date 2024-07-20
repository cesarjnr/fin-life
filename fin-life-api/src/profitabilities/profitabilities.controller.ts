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
    @Query() params: Partial<Pick<GetPortfolioAssetProfitabilityParams, 'includeIndexes' | 'interval'>>
  ): Promise<AssetProfitability> {
    const { includeIndexes, interval } = params;

    return await this.profitabilitiesService.getPortfolioAssetProfitability({
      assetId,
      portfolioId,
      includeIndexes: includeIndexes
        ? Array.isArray(includeIndexes)
          ? includeIndexes
          : [includeIndexes]
        : includeIndexes,
      interval
    });
  }
}
