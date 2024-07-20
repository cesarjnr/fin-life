import { IsEnum, IsString } from 'class-validator';

import { DataIntervals } from '../common/enums/interval';
import { MarketIndexTypes } from './marketIndexHistoricalData.entity';

export class CreateMarketIndexHistoricalDataDto {
  @IsString()
  readonly ticker: string;

  @IsEnum(DataIntervals)
  readonly interval: DataIntervals;

  @IsEnum(MarketIndexTypes)
  readonly type: MarketIndexTypes;
}
