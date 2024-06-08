import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { PortfolioAsset } from './portfolioAsset.entity';
import { UpdatePortfolioDto } from './portfolios-assets.dto';

@Controller('users/:userId/portfolios/:portfolioId/portfolios-assets')
export class PortfoliosAssetsController {
  constructor(private portfoliosAssetsService: PortfoliosAssetsService) {}

  @Get()
  public async get(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PortfolioAsset[]> {
    return await this.portfoliosAssetsService.get({ portfolioId });
  }

  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePortfolioAssetDto: UpdatePortfolioDto
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.update(id, updatePortfolioAssetDto);
  }
}
