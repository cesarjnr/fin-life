import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { PortfolioAsset } from './portfolioAsset.entity';
import {
  PortfolioAssetsOverview,
  PortfolioAssetMetrics,
  GetPortfoliosAssetsDto,
  GetPortfoliosAssetsParamsDto,
  UpdatePortfolioDto,
  FindPortfolioAssetDto
} from './portfoliosAssets.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId/portfolios-assets')
export class PortfoliosAssetsController {
  constructor(private portfoliosAssetsService: PortfoliosAssetsService) {}

  @Get()
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPortfoliosAssetsParamsDto: GetPortfoliosAssetsParamsDto
  ): Promise<GetRequestResponse<GetPortfoliosAssetsDto>> {
    return await this.portfoliosAssetsService.get({ portfolioId, ...getPortfoliosAssetsParamsDto });
  }

  @Get('overview')
  public async getOverview(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PortfolioAssetsOverview> {
    return await this.portfoliosAssetsService.getPortfolioAssetsOverview(portfolioId);
  }

  @Get(':id')
  public async find(
    @Param('id', ParseIntPipe) id: number,
    @Query() findPortfolioAssetDto: FindPortfolioAssetDto
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.find(id, findPortfolioAssetDto);
  }

  @Get(':id/metrics')
  public async getPortfolioAssetMetrics(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<PortfolioAssetMetrics> {
    return await this.portfoliosAssetsService.getPortfolioAssetMetrics(portfolioId, id);
  }

  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePortfolioAssetDto: UpdatePortfolioDto
  ): Promise<PortfolioAsset> {
    return await this.portfoliosAssetsService.update(id, updatePortfolioAssetDto);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.portfoliosAssetsService.delete(id);
  }
}
