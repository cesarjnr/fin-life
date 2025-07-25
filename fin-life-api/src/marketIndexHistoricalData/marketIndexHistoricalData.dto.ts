import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

import { DataIntervals } from '../common/enums/interval';
import { MarketIndexTypes } from './marketIndexHistoricalData.entity';
import { OrderBy } from '../common/dto/request';

enum MarketIndexHistoricalDataOrderByColumns {
  Date = 'date'
}

export class CreateMarketIndexHistoricalDataDto {
  @IsEnum(DataIntervals)
  readonly interval: DataIntervals;

  @IsString()
  readonly ticker: string;

  @IsEnum(MarketIndexTypes)
  readonly type: MarketIndexTypes;
}

export class GetMarketIndexHistoricalDataDto {
  @IsNotEmpty()
  @IsString()
  ticker: string;

  @IsNotEmpty()
  @IsNumberString()
  page: string;

  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsOptional()
  @IsString()
  orderBy?: OrderBy;

  @IsOptional()
  @IsEnum(MarketIndexHistoricalDataOrderByColumns)
  orderByColumn?: MarketIndexHistoricalDataOrderByColumns;
}

export interface MarketIndexOverview {
  interval: DataIntervals;
  ticker: string;
  type: MarketIndexTypes;
}
