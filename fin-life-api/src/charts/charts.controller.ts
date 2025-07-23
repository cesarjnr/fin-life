import { Controller, Get, Query } from '@nestjs/common';

import { DividendsChartData, GetChartDataDto } from './charts.dto';
import { ChartsService } from './charts.service';

@Controller('portfolios/:portfolioId/charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('dividends')
  public async getDividendsChartData(@Query() getChartDataDto: GetChartDataDto): Promise<DividendsChartData[]> {
    return await this.chartsService.getDividendsChartData(getChartDataDto);
  }
}
