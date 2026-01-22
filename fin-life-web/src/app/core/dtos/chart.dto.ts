export interface GetChartDataDto {
  portfolioId: number;
  assetId?: number;
  start?: string;
  end?: string;
  groupByPeriod?: ChartGroupByPeriods;
  groupByAssetProp?: ChartGroupByAssetProps;
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

export enum ChartGroupByPeriods {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}
export enum ChartGroupByAssetProps {
  Code = 'code',
  Category = 'category',
  Class = 'class',
  Sector = 'sector',
  Currency = 'currency',
}
