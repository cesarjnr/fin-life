import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';
import { UsersModule } from '../users/users.module';

@Module({
  exports: [WalletsService],
  imports: [TypeOrmModule.forFeature([Wallet]), UsersModule],
  providers: [WalletsService]
})
export class WalletsModule {}
