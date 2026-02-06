import { MarketIndexHistoricalData } from './market-index-historical-data.dto';

export interface MarketIndex {
  id: number;
  active: boolean;
  allTimeHighValue: number;
  code: string;
  interval: DateIntervals;
  type: MarketIndexTypes;
  marketIndexHistoricalData?: MarketIndexHistoricalData[];
}

export enum DateIntervals {
  Daily = 'daily',
  Monthly = 'monthly',
  Yearly = 'yearly',
}
export enum MarketIndexTypes {
  Rate = 'rate',
  Point = 'point',
  Currency = 'currency',
}
