import { IsNumber, IsOptional, IsString } from 'class-validator';

import { AssetCategories, AssetClasses } from '../assets/asset.entity';
import { GetRequestParams } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { PortfolioAsset } from './portfolioAsset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsString()
  readonly characteristic?: string;

  @IsOptional()
  @IsNumber()
  readonly expectedPercentage?: number;
}

export type GetPortfoliosAssetsParamsDto = GetRequestParams & {
  portfolioId?: number;
  relations?: string[];
};
export type GetPortfoliosAssetsDto = PortfolioAsset & {
  usdBrlExchangeRate: MarketIndexHistoricalData;
};
export interface GetPortfolioAssetMetricsDto {
  id: number;
  adjustedCost: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  expectedPercentage?: number;
  payoutsReceived: number;
  portfolioId: number;
  position: number;
  profitability: number; // Only current market price + sales
  profitabilityInPercentage: number;
  quantity: number;
  salesTotal: number;
  suggestedBuy: number;
  totalProfitability: number; // With dividends included
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
