import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { UsersModule } from '../users/users.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';
import { CommonModule } from '../common/common.module';
import { AssetsModule } from '../assets/assets.module';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';

@Module({
  controllers: [PortfoliosController],
  exports: [PortfoliosService],
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    CommonModule,
    AssetsModule,
    UsersModule,
    AssetHistoricalPricesModule,
    MarketIndexHistoricalDataModule
  ],
  providers: [PortfoliosService]
})
export class PortfoliosModule {}
