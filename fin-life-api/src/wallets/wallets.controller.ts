import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';
import { CreateWalletDto, WalletProfitability } from './wallet.dto';

@Controller('users/:userId/wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Post()
  public async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createWalletDto: CreateWalletDto
  ): Promise<Wallet> {
    return await this.walletsService.create(userId, createWalletDto);
  }

  @Get(':walletId')
  public async find(@Param('walletId', ParseIntPipe) walletId: number): Promise<Wallet> {
    return await this.walletsService.find(walletId);
  }

  @Get(':walletId/profitability')
  public async getProfitability(@Param('walletId', ParseIntPipe) walletId: number): Promise<WalletProfitability> {
    return await this.walletsService.getProfitability(walletId);
  }
}
