import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetChartDataDto {
  @IsString()
  @IsOptional()
  public assetId?: number;

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
