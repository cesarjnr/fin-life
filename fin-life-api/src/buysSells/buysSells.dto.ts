import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { BuySellTypes } from './buySell.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateBuySellDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly assetId: number;

  @IsNumber()
  readonly price: number;

  @IsEnum(BuySellTypes)
  readonly type: BuySellTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;

  @IsString()
  readonly institution: string;

  @IsNumber()
  @IsOptional()
  readonly fees?: number;

  @IsNumber()
  @IsOptional()
  readonly taxes?: number;
}

export class ImportBuysSellsDto {
  @IsOptional()
  @IsString()
  readonly assetId?: string;
}

export type GetBuysSellsDto = GetRequestParams & {
  portfolioId: number;
  assetId?: string;
  start?: string;
  end?: string;
  relations?: string[];
};
