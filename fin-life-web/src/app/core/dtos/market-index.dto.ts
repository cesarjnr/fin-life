import { MarketIndexHistoricalData } from './market-index-historical-data.dto';
import { GetRequestParams } from './request';

export interface CreateMarketIndexDto {
  code: string;
  interval: DateIntervals;
  type: MarketIndexTypes;
  from?: string;
  to?: string;
}
export interface syncMarketIndexValuesDto {
  marketIndexId?: number;
}
export interface MarketIndex {
  id: number;
  active: boolean;
  allTimeHighValue: number;
  code: string;
  interval: DateIntervals;
  type: MarketIndexTypes;
  marketIndexHistoricalData: MarketIndexHistoricalData[];
}

export type GetMarketIndexesDto = GetRequestParams & {
  codes?: string[];
  active?: boolean;
};

export enum DateIntervals {
  Daily = 'daily',
  Monthly = 'monthly',
  Yearly = 'yearly',
}
export enum MarketIndexTypes {
  Rate = 'Taxa',
  Point = 'Ponto',
  Currency = 'Moeda',
}
