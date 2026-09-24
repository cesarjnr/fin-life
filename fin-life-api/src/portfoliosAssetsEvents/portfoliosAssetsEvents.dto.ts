import { IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';

import { PortfolioAssetEventTypes } from './portfolioAssetEvent.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreatePortfolioAssetEventDto {
  @IsNumber()
  readonly quantity: number;

  @IsOptional()
  @IsNumber()
  readonly value?: number;

  @IsEnum(PortfolioAssetEventTypes)
  readonly type: PortfolioAssetEventTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly withdrawalDate?: string;
}

export class UpdatePortfolioAssetEventDto {
  @IsOptional()
  @IsNumber()
  readonly quantity?: number;

  @IsOptional()
  @IsNumber()
  readonly value?: number;

  @IsOptional()
  @IsEnum(PortfolioAssetEventTypes)
  readonly type?: PortfolioAssetEventTypes;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly withdrawalDate?: string;
}

export type GetPortfolioAssetEventsDto = GetRequestParams & {
  portfolioAssetId?: number;
  types?: PortfolioAssetEventTypes[];
  from?: string;
  to?: string;
};

export interface PortfolioAssetEventCsvRow {
  Asset: string;
  Date: string;
  Quantity: string;
  Type: PortfolioAssetEventTypes;
  Value: string;
  Withdrawal: string;
}

export interface PortfolioAssetPayoutsOverview {
  total: number;
  yieldOnCost: number;
}
