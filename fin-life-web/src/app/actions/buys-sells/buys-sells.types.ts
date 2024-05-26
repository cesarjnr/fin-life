import { Asset } from "../assets/asset.types";

export interface CreateBuySell {
  assetId: number;
  date: string;
  fees?: number;
  institution: string;
  price: number;
  quantity: number;
  type: BuySellTypes;
}
export interface BuySell {
  id: number;
  asset: Asset;
  assetId: number;
  date: string;
  fees: number | null;
  institution: string;
  price: number;
  quantity: number;
  type: BuySellTypes;
  walletId: number;
}
export interface ErrorResponse {
  message: string;
  statusCode: number;
}

export enum BuySellTypes {
  Buy = 'buy',
  Sell = 'sell'
}