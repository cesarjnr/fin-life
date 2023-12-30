import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { BuysSellsService } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CreateBuySellDto } from './buysSells.dto';

@Controller('users/:userId/wallets/:walletId/buys-sells')
export class BuysSellsController {
  constructor(private buysSellsService: BuysSellsService) {}

  @Post()
  public async create(
    @Param('walletId', ParseIntPipe) walletId: number,
    @Body() createBuySellDto: CreateBuySellDto
  ): Promise<BuySell> {
    return await this.buysSellsService.create(walletId, createBuySellDto);
  }

  @Get()
  public async get(@Param('walletId', ParseIntPipe) walletId: number): Promise<BuySell[]> {
    return await this.buysSellsService.get(walletId);
  }
}
