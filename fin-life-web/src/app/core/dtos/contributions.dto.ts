export interface GetContributionDto {
  groupBy?: string;
  monthContribution?: number;
  targetPercentages?: {
    label: string;
    percentage: number;
  }[];
}

export interface Contribution {
  contribution: number;
  currentValue: number;
  expectedValue: number;
  expectedPercentage: number;
  group: string;
  assets: {
    description: string;
    currentValue: number;
    minContribution: number;
    minPercentage: number;
    maxContribution: number;
    maxPercentage: number;
    portfolioAssetId: number;
  }[];
}
