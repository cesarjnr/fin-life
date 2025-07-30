import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

import { DataIntervals } from '../common/enums/interval';
import { MarketIndexTypes } from './marketIndexHistoricalData.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateMarketIndexHistoricalDataDto {
  @IsEnum(DataIntervals)
  readonly interval: DataIntervals;

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
  interval: DataIntervals;
  ticker: string;
  type: MarketIndexTypes;
}
