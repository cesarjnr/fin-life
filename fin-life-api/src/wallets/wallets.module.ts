import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';

@Module({
  controllers: [WalletsController],
  exports: [WalletsService],
  imports: [TypeOrmModule.forFeature([Wallet]), CommonModule, UsersModule, AssetHistoricalPricesModule],
  providers: [WalletsService]
})
export class WalletsModule {}
