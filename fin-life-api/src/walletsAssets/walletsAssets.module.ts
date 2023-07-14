import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsAssetsController } from './walletsAssets.controller';
import { WalletsAssetsService } from './walletsAssets.service';
import { WalletAsset } from './walletAsset.entity';

@Module({
  controllers: [WalletsAssetsController],
  exports: [WalletsAssetsService],
  imports: [TypeOrmModule.forFeature([WalletAsset])],
  providers: [WalletsAssetsService]
})
export class WalletsAssetsModule {}
