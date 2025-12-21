import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

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
  @IsIn(['ticker', 'category', 'class', 'sector', 'currency'])
  public groupByAssetProp?: string;
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
