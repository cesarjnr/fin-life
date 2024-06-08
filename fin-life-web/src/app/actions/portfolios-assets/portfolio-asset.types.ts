import { Asset } from "../assets/asset.types";

export interface UpdatePortfolioAsset {
  characteristic?: string;
  expectedPercentage?: number;
}
export interface PortfolioAsset {
  id: number;
  adjustedCost: number;
  asset: Asset;
  assetId: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  expectedPercentage?: number;
  lastSplitDate?: string;
  quantity: number;
  salesTotal: number;
  portfolioId: number;
}
export interface FindPortfolioAssetParams {
  relations?: string[];
}
