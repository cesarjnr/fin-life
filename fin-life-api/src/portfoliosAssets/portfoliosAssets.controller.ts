import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { PortfolioAsset } from './portfolioAsset.entity';

@Controller('users/:userId/portfolios/:portfolioId/portfolios-assets')
export class PortfoliosAssetsController {
  constructor(private portfoliosService: PortfoliosAssetsService) {}

  @Get()
  public async get(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PortfolioAsset[]> {
    return await this.portfoliosService.get({ portfolioId });
  }
}
