export interface MarketIndexHistoricalData {
  id: number;
  date: string;
  interval: DateIntervals;
  code: string;
  type: MarketIndexTypes;
  value: number;
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
