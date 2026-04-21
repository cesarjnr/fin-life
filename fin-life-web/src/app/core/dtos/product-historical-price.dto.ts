import { GetRequestParams } from "./request";

export interface AssetHistoricalPrice {
  id: number;
  assetId: number;
  date: string;
  closingPrice: number;
}

export type GetProductHistoricalPricesDto = GetRequestParams & {
  assetId: number;
};
