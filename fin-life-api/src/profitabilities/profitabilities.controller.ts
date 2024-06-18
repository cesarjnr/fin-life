import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { AssetProfitability, ProfitabilitiesService } from './profitabilities.service';

@Controller('users/:userId/portfolios/:portfolioId/profitabilities')
export class ProfitabilitiesController {
  constructor(private readonly profitabilitiesService: ProfitabilitiesService) {}

  @Get('assets/:assetId')
  public async getPortfolioAssetProfitability(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number
  ): Promise<AssetProfitability> {
    return await this.profitabilitiesService.getPortfolioAssetProfitability(assetId, portfolioId);
  }
}
