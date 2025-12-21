import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PayoutsChart, GetPayoutsCharDto } from './charts.dto';
import { ChartsService } from './charts.service';

@Controller('portfolios/:portfolioId/charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('payouts')
  public async getPayoutsChart(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPayoutsChartDto: GetPayoutsCharDto
  ): Promise<PayoutsChart[]> {
    return await this.chartsService.getPayoutsChart(portfolioId, getPayoutsChartDto);
  }
}
