import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { Operation } from './operation.entity';
import { CommonModule } from '../common/common.module';
import { AssetsModule } from '../assets/assets.module';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { AssetHistoricalPricesModule } from '../assetHistoricalPrices/assetHistoricalPrices.module';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [OperationsController],
  exports: [OperationsService],
  imports: [
    TypeOrmModule.forFeature([Operation]),
    CommonModule,
    AssetsModule,
    PortfoliosAssetsModule,
    AssetHistoricalPricesModule,
    FilesModule
  ],
  providers: [OperationsService]
})
export class OperationsModule {}
