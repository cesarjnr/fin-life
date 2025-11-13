import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { AssetCategories, AssetClasses } from './asset.entity';
import { GetRequestParams } from '../common/dto/request';
import { Currencies } from '../common/enums/number';

export class CreateAssetDto {
  @IsString()
  readonly ticker: string;

  @IsEnum(AssetCategories)
  readonly category: AssetCategories;

  @IsEnum(AssetClasses)
  readonly assetClass: AssetClasses;

  @IsEnum(Currencies)
  readonly currency: Currencies;

  @IsString()
  @IsOptional()
  readonly sector: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  readonly ticker?: string;

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
  tickers?: string[];
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
