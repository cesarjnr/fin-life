import { Module } from '@nestjs/common';

import { ProfitabilitiesController } from './profitabilities.controller';
import { CommonModule } from '../common/common.module';
import { BuysSellsModule } from '../buysSells/buysSells.module';
import { AssetsModule } from '../assets/assets.module';
import { ProfitabilitiesService } from './profitabilities.service';
import { MarketIndexHistoricalDataModule } from '../marketIndexHistoricalData/marketIndexHistoricalData.module';

@Module({
  controllers: [ProfitabilitiesController],
  imports: [CommonModule, BuysSellsModule, AssetsModule, MarketIndexHistoricalDataModule],
  providers: [ProfitabilitiesService]
})
export class ProfitabilitiesModule {}
