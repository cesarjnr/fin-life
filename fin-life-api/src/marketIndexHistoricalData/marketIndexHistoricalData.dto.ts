import { IsEnum, IsString } from 'class-validator';

import { DataIntervals } from '../common/enums/interval';
import { MarketIndexTypes } from './marketIndexHistoricalData.entity';

export class CreateMarketIndexHistoricalDataDto {
  @IsEnum(DataIntervals)
  readonly interval: DataIntervals;

  @IsString()
  readonly ticker: string;

  @IsEnum(MarketIndexTypes)
  readonly type: MarketIndexTypes;
}

export interface MarketIndexOverview {
  interval: DataIntervals;
  ticker: string;
  type: MarketIndexTypes;
}
