import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

import { DateIntervals } from '../common/enums/date';
import { MarketIndexTypes } from './marketIndexHistoricalData.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateMarketIndexHistoricalDataDto {
  @IsEnum(DateIntervals)
  readonly interval: DateIntervals;

  @IsString()
  readonly ticker: string;

  @IsEnum(MarketIndexTypes)
  readonly type: MarketIndexTypes;
}

export type GetMarketIndexHistoricalDataDto = GetRequestParams & {
  ticker: string;
  from?: string;
  to?: string;
};

export interface MarketIndexOverview {
  interval: DateIntervals;
  ticker: string;
  type: MarketIndexTypes;
}
