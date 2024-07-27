import { DataIntervals } from "@/utils/enums";

export interface MarketIndexOverview {
  interval: DataIntervals;
  ticker: string;
  type: MarketIndexTypes;
}

export enum MarketIndexTypes {
  Rate = 'rate',
  Point = 'point'
}