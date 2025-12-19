import { IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';

import { PayoutTypes } from './payout.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreatePayoutDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly value: number;

  @IsEnum(PayoutTypes)
  readonly type: PayoutTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly withdrawalDate?: string;
}

export class UpdatePayoutDto {
  @IsOptional()
  @IsNumber()
  readonly quantity: number;

  @IsOptional()
  @IsNumber()
  readonly value: number;

  @IsOptional()
  @IsEnum(PayoutTypes)
  readonly type?: PayoutTypes;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly withdrawalDate?: string;
}

export type GetPayoutsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};

export interface PayoutCsvRow {
  Asset: string;
  Date: string;
  Quantity: string;
  Type: PayoutTypes;
  Value: string;
  Withdrawal: string;
}

export interface PayoutsOverview {
  total: number;
  yieldOnCost: number;
}
