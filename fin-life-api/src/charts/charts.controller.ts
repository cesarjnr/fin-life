import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { DividendsChartData, GetChartDataDto } from './charts.dto';
import { ChartsService } from './charts.service';

@Controller('portfolios/:portfolioId/charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('dividends')
  public async getDividendsChartData(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getChartDataDto: GetChartDataDto
  ): Promise<DividendsChartData[]> {
    return await this.chartsService.getDividendsChartData(portfolioId, getChartDataDto);
  }
}
