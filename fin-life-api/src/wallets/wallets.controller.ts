import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';

@Controller('users/:userId/wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get(':walletId')
  public async find(@Param('walletId', ParseIntPipe) walletId: number): Promise<Wallet> {
    return await this.walletsService.find(walletId);
  }
}
