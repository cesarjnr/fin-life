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
  public groupBy?: string;
}

export interface DividendsChartData {
  label: string;
  data: {
    period: string;
    value: number;
    yield: number;
  }[];
}
