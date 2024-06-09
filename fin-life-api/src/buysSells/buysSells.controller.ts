import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import { BuysSellsService } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CreateBuySellDto } from './buysSells.dto';
import { PaginationParams, PaginationResponse } from 'src/common/dto/pagination';

@Controller('users/:userId/portfolios/:portfolioId/buys-sells')
export class BuysSellsController {
  constructor(private buysSellsService: BuysSellsService) {}

  @Post()
  public async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() createBuySellDto: CreateBuySellDto
  ): Promise<BuySell> {
    return await this.buysSellsService.create(portfolioId, createBuySellDto);
  }

  @Get()
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() params: PaginationParams
  ): Promise<PaginationResponse<BuySell>> {
    return await this.buysSellsService.get({ ...params, portfolioId });
  }
}
