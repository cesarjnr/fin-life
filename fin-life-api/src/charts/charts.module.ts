import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChartsController } from './charts.controller';
import { ChartsService } from './charts.service';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';
import { CommonModule } from '../common/common.module';
import { BuysSellsModule } from '../buysSells/buysSells.module';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

@Module({
  controllers: [ChartsController],
  imports: [TypeOrmModule.forFeature([PortfolioAssetDividend, PortfolioAsset]), CommonModule, BuysSellsModule],
  providers: [ChartsService]
})
export class ChartsModule {}
