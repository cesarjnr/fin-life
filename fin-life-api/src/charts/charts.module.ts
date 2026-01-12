import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChartsController } from './charts.controller';
import { Payout } from '../payouts/payout.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { CommonModule } from '../common/common.module';
import { OperationsModule } from '../operations/operations.module';
import { ChartsService } from './charts.service';

@Module({
  controllers: [ChartsController],
  imports: [TypeOrmModule.forFeature([Payout, PortfolioAsset]), CommonModule, OperationsModule],
  providers: [ChartsService]
})
export class ChartsModule {}
