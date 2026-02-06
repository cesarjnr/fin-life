import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketIndexesController } from './marketIndexes.controller';
import { MarketIndexesService } from './marketIndexes.service';
import { MarketIndex } from './marketIndex.entity';
import { MarketDataProviderModule } from '../marketDataProvider/marketDataProvider.module';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';

@Module({
  controllers: [MarketIndexesController],
  exports: [MarketIndexesService],
  imports: [TypeOrmModule.forFeature([MarketIndex]), MarketDataProviderModule, MarketIndexHistoricalDataModule],
  providers: [MarketIndexesService]
})
export class MarketIndexesModule {}
