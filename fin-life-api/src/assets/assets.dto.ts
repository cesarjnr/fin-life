import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { AssetCategories, AssetClasses, AssetCurrencies } from './asset.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateAssetDto {
  @IsString()
  readonly ticker: string;

  @IsEnum(AssetCategories)
  readonly category: AssetCategories;

  @IsEnum(AssetClasses)
  readonly assetClass: AssetClasses;

  @IsString()
  readonly sector: string;

  @IsEnum(AssetCurrencies)
  readonly currency: AssetCurrencies;
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
  @IsEnum(AssetCurrencies)
  readonly currency?: AssetCurrencies;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}

export type GetAssetsDto = GetRequestParams & {
  id?: number;
  tickers?: string[];
  active?: string;
  relations?: string[];
};
export interface FindAssetDto {
  relations?: string[];
  withLastPrice?: string;
}
