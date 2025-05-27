import { Asset } from "./asset.dto";

export interface PortfolioAsset {
  id: number;
  assetId: number;
  portfolioId: number;
  averageCost: number;
  characteristic?: string;
  expectedPercentage?: number;
  cost: number;
  adjustedCost: number;
  quantity: number;
  salesTotal: number;
  dividendsPaid: number;
  taxes: number;
  movement?: string;
  asset: Asset;
}