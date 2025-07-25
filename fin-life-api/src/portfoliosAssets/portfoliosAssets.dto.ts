import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AssetCategories, AssetClasses, AssetCurrencies } from 'src/assets/asset.entity';
import { GetRequestParams } from '../common/dto/request';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsString()
  readonly characteristic?: string;

  @IsOptional()
  @IsNumber()
  readonly expectedPercentage?: number;
}

export type GetPortfoliosAssetsDto = GetRequestParams & {
  portfolioId?: number;
};

export interface GetPortfolioAssetMetricsDto {
  id: number;
  adjustedCost: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  expectedPercentage?: number;
  dividends: number;
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
    currency: AssetCurrencies;
    currentPrice: number;
    dropOverAverageCost: number;
    dropOverAllTimeHigh: number;
    sector: string;
    ticker: string;
  };
}
