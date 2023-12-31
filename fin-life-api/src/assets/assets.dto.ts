import { IsEnum, IsString } from 'class-validator';

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
