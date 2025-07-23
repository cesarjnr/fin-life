export interface GetChartDataDto {
  portfolioId: number;
  assetId?: number;
  start?: string;
  end?: string;
  groupBy?: ChartGroupByOptions;
}

export interface DividendsChartData {
  label: string;
  data: {
    period: string;
    value: number;
  }[];
}

export enum ChartGroupByOptions {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}
