import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';

import { ContributionsService } from './contributions.service';
import { Contribution, GetContributionsDto } from './contributions.dto';
import { PortfolioOwnershipGuard } from '../portfolios/portfolio-ownership.guard';

@Controller('portfolios/:portfolioId/portfolios-assets')
@UseGuards(PortfolioOwnershipGuard)
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
