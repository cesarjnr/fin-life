import { IsEnum, IsString } from 'class-validator';

import { MarketIndexTypes } from './marketIndexHistoricalData.entity';

export class CreateMarketIndexHistoricalDataDto {
  @IsString()
  readonly ticker: string;

  @IsEnum(MarketIndexTypes)
  readonly type: MarketIndexTypes;
}
