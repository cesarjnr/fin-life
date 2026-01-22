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
  action?: PortfolioAssetActions;
  asset: Asset;
}
export interface PortfolioAssetsOverview {
  currentBalance: number;
  investedBalance: number;
  profit: number;
  profitability: number;
}
export interface PortfolioAssetMetrics {
  id: number;
  adjustedCost: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  contribution: number;
  currentPercentage: number;
  minPercentage: number;
  maxPercentage: number;
  payoutsReceived: number;
  portfolioId: number;
  position: number;
  profitability: number;
  profitabilityInPercentage: number;
  quantity: number;
  salesTotal: number;
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
    code: string;
  };
}
export interface UpdatePortfolioAssetDto {
  characteristic?: string | null;
  minPercentage?: number | null;
  maxPercentage?: number | null;
}

export type GetPortfoliosAssetsDto = PortfolioAsset & {
  usdBrlExchangeRate: MarketIndexHistoricalData;
};
export type GetPortfoliosAssetsParamsDto = GetRequestParams & {
  portfolioId: number;
};

export enum PortfolioAssetActions {
  Buy = 'Comprar',
  Sell = 'Vender',
  Hold = 'Segurar',
}
