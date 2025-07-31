import { Currencies } from './common.dto';
import { PortfolioAsset } from './portfolio-asset.dto';
import { GetRequestParams } from './request';

export interface CreatePortfolioAssetPayoutDto {
  date: string;
  type: PortfolioAssetPayoutTypes;
  quantity: number;
  value: number;
}
export type GetPortfolioAssetsPayoutsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};
export interface PortfolioAssetPayout {
  id: number;
  currency: Currencies;
  portfolioAssetId: number;
  date: string;
  quantity: number;
  receivedDateExchangeRate: number;
  taxes: number;
  total: number;
  type: PortfolioAssetPayoutTypes;
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
export interface PortfolioAssetsPayoutsOverview {
  total: number;
  yieldOnCost: number;
}

export type UpdatePortfolioAssetPayoutDto =
  Partial<CreatePortfolioAssetPayoutDto>;

export enum PortfolioAssetPayoutTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento',
}
