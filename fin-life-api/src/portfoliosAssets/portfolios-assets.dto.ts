import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsString()
  readonly characteristic?: string;

  @IsOptional()
  @IsNumber()
  readonly expectedPercentage?: number;
}
