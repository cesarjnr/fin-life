import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { PortfolioAsset } from './portfolioAsset.entity';
import { GetPortfolioAssetMetricsDto, GetPortfoliosAssetsDto, UpdatePortfolioDto } from './portfoliosAssets.dto';
import { PaginationResponse } from '../common/dto/pagination';

@Controller('portfolios/:portfolioId/assets')
export class PortfoliosAssetsController {
  constructor(private portfoliosAssetsService: PortfoliosAssetsService) {}

  @Get()
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPortfoliosAssetsDto: GetPortfoliosAssetsDto
  ): Promise<PaginationResponse<PortfolioAsset>> {
    return await this.portfoliosAssetsService.get({ portfolioId, ...getPortfoliosAssetsDto });
  }

  @Get(':assetId')
  public async find(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.find({
      portfolioId,
      assetId,
      order: { asset: { assetHistoricalPrices: { date: 'DESC' } } }
    });
  }

  @Patch(':assetId/portfolios-assets/:portfolioAssetId')
  public async update(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() updatePortfolioAssetDto: UpdatePortfolioDto
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.update(portfolioAssetId, updatePortfolioAssetDto);
  }

  @Delete(':assetId/portfolios-assets/:portfolioAssetId')
  public async delete(@Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number): Promise<void> {
    return await this.portfoliosAssetsService.delete(portfolioAssetId);
  }

  @Get(':assetId/metrics')
  public async getPortfolioAssetMetrics(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number
  ): Promise<GetPortfolioAssetMetricsDto> {
    return await this.portfoliosAssetsService.getPortfolioAssetMetrics(portfolioId, assetId);
  }
}
