import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PayoutsController } from './payouts.controller';
import { Payout } from './payout.entity';
import { CommonModule } from '../common/common.module';
import { FilesModule } from '../files/files.module';
import { MarketIndexesModule } from '../marketIndexes/marketIndexes.module';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { PayoutsService } from './payouts.service';

@Module({
  controllers: [PayoutsController],
  imports: [
    TypeOrmModule.forFeature([Payout]),
    CommonModule,
    FilesModule,
    MarketIndexesModule,
    MarketIndexHistoricalDataModule,
    PortfoliosAssetsModule
  ],
  providers: [PayoutsService]
})
export class PayoutsModule {}
