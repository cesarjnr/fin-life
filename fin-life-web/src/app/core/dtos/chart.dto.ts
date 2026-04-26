export interface GetPayoutsChartDataDto {
  portfolioId: number;
  assetId?: number;
  start?: string;
  end?: string;
  groupByPeriod?: PayoutChartGroupByPeriods;
  groupByAssetProp?: PayoutChartGroupByAssetProps;
}
export interface GetAssetChartDataDto {
  assetId: number;
  period?: AssetChartPeriods;
}
export interface PayoutsChartData {
  period: string;
  data: {
    label: string;
    labelPosition: number;
    value: number;
    yield: number;
  }[];
}
export interface AssetChartData {
  date: string;
  value: number;
  yield: number;
}

export enum AssetChartPeriods {
  SevenDays = '7d',
  OneMonth = '1m',
  SixMonths = '6m',
  OneYear = '1y',
  FiveYears = '5y',
  YearToDate = 'ytd',
  Max = 'max',
}
export enum PayoutChartGroupByPeriods {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}
export enum PayoutChartGroupByAssetProps {
  Code = 'code',
  Category = 'category',
  Class = 'class',
  Sector = 'sector',
  Currency = 'currency',
}
