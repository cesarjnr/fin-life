import { Asset } from '@/app/actions/assets/asset.types';

export interface Portfolio {
  id: number;
  description: string;
  userId: number;
}
export interface PortfolioAsset {
  id: number;
  asset: Asset;
  assetId: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  expectedPercentage?: number;
  lastSplitDate?: string;
  position: number;
  quantity: number;
  salesTotal: number;
  portfolioId: number;
}
export interface PortfolioOverview {
  currentBalance: number;
  investedBalance: number;
  profit: number;
  profitability: number;
}
