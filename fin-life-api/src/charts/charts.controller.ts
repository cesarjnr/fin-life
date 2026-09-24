import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';

import { PayoutsChart, GetPayoutsCharDto, AssetChartData, GetAssetChartDto } from './charts.dto';
import { ChartsService } from './charts.service';
import { PortfolioOwnershipGuard } from '../portfolios/portfolio-ownership.guard';

@Controller('charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('portfolios/:portfolioId/payouts')
  @UseGuards(PortfolioOwnershipGuard)
  public async getPayoutsChart(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPayoutsChartDto: GetPayoutsCharDto
  ): Promise<PayoutsChart[]> {
    return await this.chartsService.getPayoutsChart(portfolioId, getPayoutsChartDto);
  }

  @Get('assets/:assetId')
  public async getAssetChart(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() getAssetChartDto: GetAssetChartDto
  ): Promise<AssetChartData[]> {
    return await this.chartsService.getAssetChart(assetId, getAssetChartDto);
  }
}
