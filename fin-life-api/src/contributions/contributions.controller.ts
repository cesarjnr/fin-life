import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { ContributionsService } from './contributions.service';
import { Contribution, GetContributionsDto } from './contributions.dto';

@Controller('portfolios/:portfolioId/portfolios-assets')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Get('contributions')
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getContributionsDto: GetContributionsDto
  ): Promise<Contribution[]> {
    return await this.contributionsService.get(portfolioId, getContributionsDto);
  }
}
