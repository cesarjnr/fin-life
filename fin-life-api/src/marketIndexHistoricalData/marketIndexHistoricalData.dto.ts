import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { DateIntervals } from '../common/enums/date';
import { MarketIndexTypes } from './marketIndexHistoricalData.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateMarketIndexHistoricalDataDto {
  @IsEnum(DateIntervals)
  readonly interval: DateIntervals;

  @IsString()
  readonly code: string;

  @IsEnum(MarketIndexTypes)
  readonly type: MarketIndexTypes;

  @IsOptional()
  @IsDateString()
  readonly from?: string;

  @IsOptional()
  @IsDateString()
  readonly to?: string;
}

export type GetMarketIndexHistoricalDataDto = GetRequestParams & {
  code: string;
  from?: string;
  to?: string;
};

export interface MarketIndexOverview {
  interval: DateIntervals;
  code: string;
  type: MarketIndexTypes;
}
