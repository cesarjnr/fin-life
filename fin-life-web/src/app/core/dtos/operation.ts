import { Currencies } from './common.dto';
import { PortfolioAsset } from './portfolio-asset.dto';
import { GetRequestParams } from './request';

export interface CreateOperationDto {
  assetId: number;
  date: string;
  fees?: number;
  institution: string;
  price: number;
  quantity: number;
  type: OperationTypes;
}

export interface ImportOperationsDto {
  assetId: number;
  file: File;
}

export interface Operation {
  id: number;
  currency: Currencies;
  date: string;
  exchangeRate: number;
  fees: number;
  institution: string;
  portfolioAsset: PortfolioAsset;
  price: number;
  quantity: number;
  total: number;
  type: OperationTypes;
  taxes: number;
}

export type GetOperationsDto = GetRequestParams & {
  portfolioAssetId?: number;
  assetId?: number;
};

export enum OperationTypes {
  Buy = 'Compra',
  Sell = 'Venda',
}
