import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { UsersModule } from '../users/users.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  controllers: [PortfoliosController],
  exports: [PortfoliosService],
  imports: [TypeOrmModule.forFeature([Portfolio]), AssetsModule, UsersModule, AssetHistoricalPricesModule],
  providers: [PortfoliosService]
})
export class PortfoliosModule {}
