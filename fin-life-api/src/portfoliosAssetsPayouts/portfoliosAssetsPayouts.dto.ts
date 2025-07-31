import { IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';

import { PortfolioAssetPayoutTypes } from './portfolioAssetPayout.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreatePortfolioAssetPayoutDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly value: number;

  @IsEnum(PortfolioAssetPayoutTypes)
  readonly type: PortfolioAssetPayoutTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;
}

export class UpdatePortfolioAssetPayoutDto {
  @IsOptional()
  @IsNumber()
  readonly quantity: number;

  @IsOptional()
  @IsNumber()
  readonly value: number;

  @IsOptional()
  @IsEnum(PortfolioAssetPayoutTypes)
  readonly type?: PortfolioAssetPayoutTypes;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;
}

export type GetPortfolioAssetPayoutsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};

export interface PortfolioAssetPayoutCsvRow {
  Asset: string;
  Date: string;
  Quantity: string;
  Type: PortfolioAssetPayoutTypes;
  Value: string;
}

export interface PortfolioAssetsPayoutsOverview {
  total: number;
  yieldOnCost: number;
}
