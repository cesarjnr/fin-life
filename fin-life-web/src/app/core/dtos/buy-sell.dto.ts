import { Asset } from './asset.dto';
import { GetRequestParams } from './request';

export interface CreateBuySellDto {
  assetId: number;
  date: string;
  fees?: number;
  institution: string;
  price: number;
  quantity: number;
  type: BuySellTypes;
}

export interface ImportBuysSellsDto {
  assetId: number;
  file: File;
}

export interface BuySell {
  id: number;
  quantity: number;
  price: number;
  type: BuySellTypes;
  date: string;
  institution: string;
  assetId: number;
  portfolioId: number;
  fees: number;
  total: number;
  exchangeRate: number;
  taxes: number;
  asset: Asset;
}

export type GetBuysSellsDto = GetRequestParams & {
  assetId?: number;
};

export enum BuySellTypes {
  Buy = 'Compra',
  Sell = 'Venda',
}
