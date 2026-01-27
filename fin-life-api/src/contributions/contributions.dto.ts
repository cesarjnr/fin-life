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
  @IsIn(['category', 'class'])
  groupBy: string;

  @ValidateIf((o) => o.groupBy)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetPercentage)
  targetPercentages: TargetPercentage[];
}

export interface Contribution {
  asset: string;
  currentValue: number;
  minContribution: number;
  maxContribution: number;
  portfolioAssetId: number;
}
