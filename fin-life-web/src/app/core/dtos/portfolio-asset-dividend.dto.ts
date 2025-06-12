import { PortfolioAsset } from './portfolio-asset.dto';

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

export enum PortfolioAssetDividendTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento',
}
