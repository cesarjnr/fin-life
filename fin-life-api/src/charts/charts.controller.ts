import { Controller, Get, Query } from '@nestjs/common';

import { GetChartDataDto } from './charts.dto';
import { DividendsChartData, ChartsService } from './charts.service';

@Controller('portfolios/:portfolioId/charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('dividends')
  public async getDividendsChartData(@Query() getChartDataDto: GetChartDataDto): Promise<DividendsChartData[]> {
    return await this.chartsService.getDividendsChartData(getChartDataDto);
  }
}
