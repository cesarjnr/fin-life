import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
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
    @Param('portfolioId', ParseIntPipe) portfolioId: number
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.find({
      assetId,
      portfolioId,
      order: { asset: { assetHistoricalPrices: { date: 'DESC' } } }
    });
  }

  @Patch(':assetId')
  public async update(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() updatePortfolioAssetDto: UpdatePortfolioDto
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.update(assetId, portfolioId, updatePortfolioAssetDto);
  }

  @Delete(':assetId')
  public async delete(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number
  ): Promise<void> {
    return await this.portfoliosAssetsService.delete(assetId, portfolioId);
  }
}
