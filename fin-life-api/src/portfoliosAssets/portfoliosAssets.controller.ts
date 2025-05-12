import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { PortfolioAsset } from './portfolioAsset.entity';
import { GetPortfolioAssetMetricsDto, UpdatePortfolioDto } from './portfolios-assets.dto';

@Controller('users/:userId/portfolios/:portfolioId/assets')
export class PortfoliosAssetsController {
  constructor(private portfoliosAssetsService: PortfoliosAssetsService) {}

  @Get()
  public async get(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PortfolioAsset[]> {
    return await this.portfoliosAssetsService.get({ portfolioId });
  }

  @Get(':assetId/portfolios-assets/:portfolioAssetId')
  public async find(@Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.find({
      id: portfolioAssetId,
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

  @Get(':assetId/portfolios-assets/:portfolioAssetId/metrics')
  public async getPortfolioAssetMetrics(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number
  ): Promise<GetPortfolioAssetMetricsDto> {
    return await this.portfoliosAssetsService.getPortfolioAssetMetrics(portfolioAssetId);
  }
}
