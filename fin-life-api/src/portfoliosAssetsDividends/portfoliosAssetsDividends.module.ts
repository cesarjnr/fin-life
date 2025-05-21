import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosAssetsDividendsController } from './portfoliosAssetsDividends.controller';
import { PortfolioAssetDividend } from './portfolioAssetDividend.entity';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { FilesModule } from '../files/files.module';
import { CommonModule } from '../common/common.module';
import { PortfoliosAssetsDividendsService } from './portfoliosAssetsDividends.service';

@Module({
  controllers: [PortfoliosAssetsDividendsController],
  imports: [TypeOrmModule.forFeature([PortfolioAssetDividend]), PortfoliosAssetsModule, FilesModule, CommonModule],
  providers: [PortfoliosAssetsDividendsService]
})
export class PortfoliosAssetsDividendsModule {}
