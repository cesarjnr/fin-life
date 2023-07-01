import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BuysSellsController } from './buysSells.controller';
import { BuySell } from './buySell.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { AssetsModule } from '../assets/assets.module';
import { BuysSellsService } from './buysSells.service';

@Module({
  controllers: [BuysSellsController],
  imports: [TypeOrmModule.forFeature([BuySell]), WalletsModule, AssetsModule],
  providers: [BuysSellsService]
})
export class BuysSellsModule {}
