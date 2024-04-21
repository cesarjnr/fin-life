import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { BuysSellsService } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CreateBuySellDto } from './buysSells.dto';

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
  public async get(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<BuySell[]> {
    return await this.buysSellsService.get(portfolioId);
  }
}
