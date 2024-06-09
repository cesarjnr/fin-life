import { Module } from '@nestjs/common';

import { ProfitabilitiesController } from './profitabilities.controller';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { BuysSellsModule } from '../buysSells/buysSells.module';
import { ProfitabilitiesService } from './profitabilities.service';

@Module({
  controllers: [ProfitabilitiesController],
  imports: [PortfoliosAssetsModule, BuysSellsModule],
  providers: [ProfitabilitiesService]
})
export class ProfitabilitiesModule {}
