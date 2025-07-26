import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class GetChartDataDto {
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
}

export interface DividendsChartData {
  period: string;
  data: {
    label: string;
    labelPosition: number;
    value: number;
    yield: number;
  }[];
}
