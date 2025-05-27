import { Asset } from "./asset.dto";

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

export enum BuySellTypes {
  Buy = 'Compra',
  Sell = 'Venda'
}