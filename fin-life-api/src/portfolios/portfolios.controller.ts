import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { PortfolioOverview, PutPorfolioDto } from './portfolio.dto';

@Controller('users/:userId/portfolios')
export class PortfoliosController {
  constructor(private portfoliosService: PortfoliosService) {}

  @Post()
  public async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createPortfolioDto: PutPorfolioDto
  ): Promise<Portfolio> {
    return await this.portfoliosService.create(userId, createPortfolioDto);
  }

  @Get()
  public async get(@Param('userId', ParseIntPipe) userId: number): Promise<Portfolio[]> {
    return await this.portfoliosService.get(userId);
  }

  @Get(':portfolioId')
  public async find(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<Portfolio> {
    return await this.portfoliosService.find(portfolioId);
  }

  @Get(':portfolioId/overview')
  public async getOverview(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PortfolioOverview> {
    return await this.portfoliosService.getOverview(portfolioId);
  }

  @Put(':portfolioId')
  public async update(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() updatePortfolioDto: PutPorfolioDto
  ): Promise<Portfolio> {
    return await this.portfoliosService.update(portfolioId, updatePortfolioDto);
  }

  @Delete(':portfolioId')
  @HttpCode(204)
  public async delete(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<void> {
    return await this.portfoliosService.delete(portfolioId);
  }
}
