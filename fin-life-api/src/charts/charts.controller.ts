import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PayoutsChartData, GetChartDataDto } from './charts.dto';
import { ChartsService } from './charts.service';

@Controller('portfolios/:portfolioId/charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('payouts')
  public async getPayoutsChartData(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getChartDataDto: GetChartDataDto
  ): Promise<PayoutsChartData[]> {
    return await this.chartsService.getPayoutsChartData(portfolioId, getChartDataDto);
  }
}
