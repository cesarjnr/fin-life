import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { AssetCategories, AssetClasses } from './asset.entity';

export class CreateAssetDto {
  @IsString()
  readonly ticker: string;

  @IsEnum(AssetCategories)
  readonly category: AssetCategories;

  @IsEnum(AssetClasses)
  readonly assetClass: AssetClasses;

  @IsString()
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
  @IsBoolean()
  readonly active?: boolean;
}
