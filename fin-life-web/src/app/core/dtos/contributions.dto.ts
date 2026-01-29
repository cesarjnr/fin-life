export interface GetContributionDto {
  groupBy?: string;
  monthContribution?: number;
  targetPercentages?: {
    label: string;
    percentage: number;
  }[];
}

export interface Contribution {
  asset: string;
  currentValue: number;
  minContribution: number;
  maxContribution: number;
  portfolioAssetId: number;
}
