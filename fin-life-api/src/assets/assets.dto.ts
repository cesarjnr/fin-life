import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { AssetCategories, AssetClasses } from './asset.entity';
import { GetRequestParams } from '../common/dto/request';
import { Currencies } from '../common/enums/number';

export class CreateAssetDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly code: string;

  @IsEnum(AssetCategories)
  readonly category: AssetCategories;

  @IsEnum(AssetClasses)
  readonly assetClass: AssetClasses;

  @IsEnum(Currencies)
  readonly currency: Currencies;

  @IsOptional()
  @IsString()
  readonly sector?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly startDate?: string;

  @IsOptional()
  @IsNumber()
  readonly rate?: number;

  @IsOptional()
  @IsString()
  readonly index?: string;
}
export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly code?: string;

  @IsOptional()
  @IsEnum(AssetCategories)
  readonly category?: AssetCategories;

  @IsOptional()
  @IsEnum(AssetClasses)
  readonly assetClass?: AssetClasses;

  @IsOptional()
  @IsString()
  readonly sector?: string;

  @IsOptional()
  @IsEnum(Currencies)
  readonly currency?: Currencies;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}

export type GetAssetsDto = GetRequestParams & {
  id?: number;
  codes?: string[];
  active?: boolean;
  relations?: string[];
};

export interface FindAssetDto {
  relations?: string[];
  withLastPrice?: string;
  active?: boolean;
}
export interface SyncPricesDto {
  assetId?: number;
}
