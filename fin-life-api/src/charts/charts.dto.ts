import { IsDateString, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export enum ChartPeriod {
  SevenDays = '7d',
  OneMonth = '1m',
  SixMonths = '6m',
  OneYear = '1y',
  FiveYears = '5y',
  YearToDate = 'ytd',
  Max = 'max'
}
export class GetPayoutsCharDto {
  @IsString()
  @IsOptional()
  public assetId?: string;

  @IsString()
  @IsOptional()
  @IsDateString()
  public start?: string;

  @IsString()
  @IsOptional()
  @IsDateString()
  public end?: string;

  @IsString()
  @IsOptional()
  @IsIn(['day', 'month', 'year'])
  public groupByPeriod?: string;

  @IsString()
  @IsOptional()
  @IsIn(['code', 'category', 'class', 'sector', 'currency'])
  public groupByAssetProp?: string;
}

export class GetAssetChartDto {
  @IsEnum(ChartPeriod)
  @IsOptional()
  public period?: ChartPeriod;
}

export interface PayoutsChart {
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
