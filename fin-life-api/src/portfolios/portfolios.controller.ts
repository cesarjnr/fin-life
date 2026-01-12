import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';

import { Request } from '../common/dto/request';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { PutPorfolioDto } from './portfolio.dto';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private portfoliosService: PortfoliosService) {}

  @Post()
  public async create(@Req() request: Request, @Body() createPortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    return await this.portfoliosService.create(request.user.sub, createPortfolioDto);
  }

  @Get()
  public async get(@Req() request: Request): Promise<Portfolio[]> {
    return await this.portfoliosService.get(request.user.sub);
  }

  @Get(':portfolioId')
  public async find(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<Portfolio> {
    return await this.portfoliosService.find(portfolioId);
  }

  @Put('portfolios/:portfolioId')
  public async update(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() updatePortfolioDto: PutPorfolioDto
  ): Promise<Portfolio> {
    return await this.portfoliosService.update(portfolioId, updatePortfolioDto);
  }

  @Delete('portfolios/:portfolioId')
  @HttpCode(204)
  public async delete(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<void> {
    return await this.portfoliosService.delete(portfolioId);
  }
}
