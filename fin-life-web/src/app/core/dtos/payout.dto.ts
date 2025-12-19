import { Currencies } from './common.dto';
import { PortfolioAsset } from './portfolio-asset.dto';
import { GetRequestParams } from './request';

export interface CreatePayoutDto {
  date: string;
  type: PayoutTypes;
  quantity: number;
  value: number;
  withdrawalDate?: string;
}
export type GetPayoutsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};
export interface Payout {
  id: number;
  currency: Currencies;
  portfolioAssetId: number;
  date: string;
  quantity: number;
  receivedDateExchangeRate: number;
  taxes: number;
  total: number;
  type: PayoutTypes;
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
export interface PayoutsOverview {
  total: number;
  yieldOnCost: number;
}

export type UpdatePayoutDto = Partial<CreatePayoutDto>;

export enum PayoutTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento',
}
