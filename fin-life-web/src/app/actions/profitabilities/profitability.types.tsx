import { DataIntervals } from "@/utils/enums";

export interface GetPortfolioAssetProfitabilityParams {
  assetId: number;
  includeIndexes?: string[];
  interval?: DataIntervals;
  portfolioId: number;
  userId: number;
};

export interface PortfolioAssetProfitability {
  timestamps: number[];
  values: {
    [key: string]: number[]
  };
}
