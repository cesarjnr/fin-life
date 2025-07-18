import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChartsController } from './charts.controller';
import { ChartsService } from './charts.service';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';

@Module({
  controllers: [ChartsController],
  imports: [TypeOrmModule.forFeature([PortfolioAssetDividend])],
  providers: [ChartsService]
})
export class ChartsModule {}
