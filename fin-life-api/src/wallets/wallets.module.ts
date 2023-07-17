import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';
import { UsersModule } from '../users/users.module';
import { WalletsAssetsModule } from '../walletsAssets/walletsAssets.module';

@Module({
  controllers: [WalletsController],
  exports: [WalletsService],
  imports: [TypeOrmModule.forFeature([Wallet]), UsersModule, WalletsAssetsModule],
  providers: [WalletsService]
})
export class WalletsModule {}
