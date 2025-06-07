import {
  Asset,
  AssetCategories,
  AssetClasses,
  AssetCurrencies,
} from './asset.dto';

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
export interface PortfolioAssetMetrics {
  id: number;
  portfolioId: number;
  adjustedCost: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  expectedPercentage?: number;
  dividends: number;
  position: number;
  profitability: number;
  profitabilityInPercentage: number;
  quantity: number;
  salesTotal: number;
  suggestedBuy: number;
  totalProfitability: number;
  totalProfitabilityInPercentage: number;
  yieldOnCost: number;
  asset: {
    id: number;
    allTimeHighPrice: number;
    category: AssetCategories;
    class: AssetClasses;
    currency: AssetCurrencies;
    currentPrice: number;
    dropOverAverageCost: number;
    dropOverAllTimeHigh: number;
    sector: string;
    ticker: string;
  };
}
