import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetsController } from './assets.controller';
import { Asset } from './asset.entity';
import { MarketDataProviderModule } from '../marketDataProvider/marketDataProvider.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';
import { AssetsService } from './assets.service';
import { DividendHistoricalPaymentsModule } from '../dividendHistoricalPayments/dividendHistoricalPayments.module';
import { SplitHistoricalEventsModule } from '../splitHistoricalEvents/splitHistoricalEvents.module';
import { FilesModule } from '../files/files.module';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [AssetsController],
  imports: [
    TypeOrmModule.forFeature([Asset]),
    MarketDataProviderModule,
    AssetHistoricalPricesModule,
    DividendHistoricalPaymentsModule,
    SplitHistoricalEventsModule
  ],
  exports: [AssetsService],
  providers: [AssetsService]
})
export class AssetsModule {}
