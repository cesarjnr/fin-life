import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { WalletsAssetsService } from './walletsAssets.service';
import { WalletAsset } from './walletAsset.entity';

@Controller('users/:userId/wallets/:walletId/wallets-assets')
export class WalletsAssetsController {
  constructor(private walletsAssetsService: WalletsAssetsService) {}

  @Get()
  public async get(@Param('walletId', ParseIntPipe) walletId: number): Promise<WalletAsset[]> {
    return await this.walletsAssetsService.get({ walletId });
  }
}
