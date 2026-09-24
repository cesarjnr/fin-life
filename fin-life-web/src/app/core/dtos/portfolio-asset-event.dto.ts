import { Currencies } from './common.dto';
import { PortfolioAsset } from './portfolio-asset.dto';
import { GetRequestParams } from './request';

export interface CreatePortfolioAssetEventDto {
  date: string;
  type: PortfolioAssetEventTypes;
  quantity: number;
  value?: number;
  withdrawalDate?: string;
}
export type GetPortfolioAssetEventsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};
export interface PortfolioAssetEvent {
  id: number;
  currency: Currencies;
  portfolioAssetId: number;
  date: string;
  quantity: number;
  receivedDateExchangeRate: number;
  taxes: number;
  total: number;
  type: PortfolioAssetEventTypes;
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

// export type UpdatePayoutDto = Partial<CreatePayoutDto>;

export enum PortfolioAssetEventTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento',
  Bonus = 'Bonificação',
  FractionalAuction = 'Leilão de Fração',
}
