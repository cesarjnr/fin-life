import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AssetCategories, AssetClasses } from '../assets/asset.entity';
import { GetRequestParams } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { PortfolioAsset } from './portfolioAsset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { Type } from 'class-transformer';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsString()
  readonly characteristic?: string;

  @IsOptional()
  @IsNumber()
  readonly expectedPercentage?: number;
}

export class FindPortfolioAssetRelationsDto {
  @IsString()
  @IsIn(['payouts', 'operations'])
  name: 'payouts' | 'operations';

  @IsString()
  alias: string;
}

export class FindPortfolioAssetDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FindPortfolioAssetRelationsDto)
  readonly relations: FindPortfolioAssetRelationsDto[];
}

export type GetPortfoliosAssetsParamsDto = GetRequestParams & {
  open?: boolean;
  assetId?: number;
  portfolioId?: number;
  relations?: {
    name: 'payouts' | 'operations';
    alias: string;
  }[];
};
export type GetPortfoliosAssetsDto = PortfolioAsset & {
  usdBrlExchangeRate: MarketIndexHistoricalData;
};

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
  minPercentage?: number;
  maxPercentage?: number;
  payoutsReceived: number;
  portfolioId: number;
  position: number;
  profitability: number; // Only current market price + sales
  profitabilityInPercentage: number;
  quantity: number;
  salesTotal: number;
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
