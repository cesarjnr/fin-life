import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsAssetsService } from './walletsAssets.service';
import { WalletAsset } from './walletAsset.entity';

@Module({
  exports: [WalletsAssetsService],
  imports: [TypeOrmModule.forFeature([WalletAsset])],
  providers: [WalletsAssetsService]
})
export class WalletsAssetsModule {}
