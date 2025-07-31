import { Asset, AssetCategories, AssetClasses } from './asset.dto';
import { Currencies } from './common.dto';
import { MarketIndexHistoricalData } from './market-index-historical-data.dto';
import { GetRequestParams } from './request';

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
  payoutsReceived: number;
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
  payoutsReceived: number;
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
    currency: Currencies;
    currentPrice: number;
    dropOverAverageCost: number;
    dropOverAllTimeHigh: number;
    sector: string;
    ticker: string;
  };
}

export type GetPortfoliosAssetsDto = PortfolioAsset & {
  usdBrlExchangeRate: MarketIndexHistoricalData;
};
export type GetPortfoliosAssetsParamsDto = GetRequestParams & {
  portfolioId: number;
};
