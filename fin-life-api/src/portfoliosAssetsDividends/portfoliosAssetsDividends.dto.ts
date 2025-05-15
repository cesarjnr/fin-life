import { IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';

import { PortfolioAssetDividendTypes } from './portfolioAssetDividend.entity';

export class CreatePortfolioAssetDividendDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly value: number;

  @IsOptional()
  @IsNumber()
  readonly fees: number;

  @IsEnum(PortfolioAssetDividendTypes)
  readonly type: PortfolioAssetDividendTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;
}

export class UpdatePortfolioAssetDividendDto {
  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  fees: number;

  @IsOptional()
  @IsEnum(PortfolioAssetDividendTypes)
  type?: PortfolioAssetDividendTypes;
}
