import { PortfolioAsset } from './portfolio-asset.dto';

export interface CreatePortfolioAssetDividendDto {
  date: string;
  type: PortfolioAssetDividendTypes;
  quantity: number;
  value: number;
}
export interface PortfolioAssetDividend {
  id: number;
  portfolioAssetId: number;
  date: string;
  quantity: number;
  receivedDateExchangeRate: number;
  taxes: number;
  total: number;
  type: PortfolioAssetDividendTypes;
  value: number;
  withdrawalDate?: string;
  withdrawalDateExchangeRate: number;
  portfolioAsset: PortfolioAsset;
}
export interface Portfolio {
  id: number;
  description: string;
  default: boolean;
  userId: number;
}

export interface PortfolioAssetsDividendsOverview {
  total: number;
  yieldOnCost: number;
}

export type UpdatePortfolioAssetDividendDto =
  Partial<CreatePortfolioAssetDividendDto>;

export enum PortfolioAssetDividendTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento',
}
