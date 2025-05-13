import { IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';

import { PortfolioAssetDividendTypes } from './portfolioAssetDividend.entity';

export class CreatePortfolioAssetDividendDto {
  @IsNumber()
  sharesAmount: number;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  fees: number;

  @IsEnum(PortfolioAssetDividendTypes)
  type: PortfolioAssetDividendTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;
}
