import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';

import { FindPortfolioAssetParams, PortfoliosAssetsService } from './portfoliosAssets.service';
import { PortfolioAsset } from './portfolioAsset.entity';
import { UpdatePortfolioDto } from './portfolios-assets.dto';

@Controller('users/:userId/portfolios/:portfolioId/assets')
export class PortfoliosAssetsController {
  constructor(private portfoliosAssetsService: PortfoliosAssetsService) {}

  @Get()
  public async get(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PortfolioAsset[]> {
    return await this.portfoliosAssetsService.get({ portfolioId });
  }

  @Get(':assetId')
  public async find(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() params: FindPortfolioAssetParams
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.find(assetId, portfolioId, params);
  }

  @Patch(':assetId')
  public async update(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() updatePortfolioAssetDto: UpdatePortfolioDto
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.update(assetId, portfolioId, updatePortfolioAssetDto);
  }
}