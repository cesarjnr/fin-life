import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { BuysSellsService } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CreateBuySellDto } from './buysSells.dto';

@Controller('users/:userId/wallets/:walletId/buys-sells')
export class BuysSellsController {
  constructor (
    private buysSellsService: BuysSellsService
  ) {}

  @Post()
  public async create(
    @Param('walletId', ParseIntPipe) walletId: number,
    @Body() createBuySellDto: CreateBuySellDto
  ): Promise<BuySell> {
    return await this.buysSellsService.create(walletId, createBuySellDto);
  }
}
