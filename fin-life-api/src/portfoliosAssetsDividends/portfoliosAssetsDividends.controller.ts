import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { PortfoliosAssetsDividendsService } from './portfoliosAssetsDividends.service';
import { PortfolioAssetDividend } from './portfolioAssetDividend.entity';
import { CreatePortfolioAssetDividendDto } from './portfoliosAssetsDividends.dto';

@Controller('users/:userId/portfolios/:portfolioId/portfolios-assets/:portfolioAssetId/portfolios-assets-dividends')
export class PortfoliosAssetsDividendsController {
  constructor(private portfoliosAssetsDividendsService: PortfoliosAssetsDividendsService) {}

  @Post()
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    return await this.portfoliosAssetsDividendsService.create(portfolioAssetId, createPortfolioAssetDividendDto);
  }
}
