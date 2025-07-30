import { IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';

import { PortfolioAssetDividendTypes } from './portfolioAssetDividend.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreatePortfolioAssetDividendDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly value: number;

  @IsEnum(PortfolioAssetDividendTypes)
  readonly type: PortfolioAssetDividendTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;
}

export class UpdatePortfolioAssetDividendDto {
  @IsOptional()
  @IsNumber()
  readonly quantity: number;

  @IsOptional()
  @IsNumber()
  readonly value: number;

  @IsOptional()
  @IsEnum(PortfolioAssetDividendTypes)
  readonly type?: PortfolioAssetDividendTypes;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;
}

export type GetPortfolioAssetDividendsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};

export interface PortfolioAssetDividendCsvRow {
  Asset: string;
  Date: string;
  Quantity: string;
  Type: PortfolioAssetDividendTypes;
  Value: string;
}

export interface PortfolioAssetsDividendsOverview {
  total: number;
  yieldOnCost: number;
}
