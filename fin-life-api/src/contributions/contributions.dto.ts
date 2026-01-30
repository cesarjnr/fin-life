import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';

class TargetPercentage {
  @IsString()
  label: string;

  @Type(() => Number)
  @IsNumber()
  percentage: number;
}
export class GetContributionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monthContribution?: number;

  @IsOptional()
  @IsIn(['portfolio', 'category', 'class'])
  groupBy?: string;

  @ValidateIf((o) => o.groupBy && o.groupBy !== 'portfolio')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetPercentage)
  targetPercentages?: TargetPercentage[];
}

export interface Contribution {
  asset: string;
  assetCurrentValue: number;
  minContribution: number;
  minPercentage: number;
  maxContribution: number;
  maxPercentage: number;
  portfolioAssetId: number;
}
