import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketIndexHistoricalDataController } from './marketIndexHistoricalData.controller';
import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { CommonModule } from '../common/common.module';
import { MarketDataProviderModule } from '../marketDataProvider/marketDataProvider.module';
import { MarketIndexHistoricalDataService } from './marketIndexHistoricalData.service';

@Module({
  controllers: [MarketIndexHistoricalDataController],
  exports: [MarketIndexHistoricalDataService],
  imports: [TypeOrmModule.forFeature([MarketIndexHistoricalData]), CommonModule, MarketDataProviderModule],
  providers: [MarketIndexHistoricalDataService]
})
export class MarketIndexHistoricalDataModule {}
