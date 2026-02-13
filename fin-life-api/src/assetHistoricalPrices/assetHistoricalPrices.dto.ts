import { GetRequestParams } from '../common/dto/request';

export type GetAssetHistoricalPricesDto = GetRequestParams & {
  assetIds?: number[];
  from?: string;
  to?: string;
};
export type FindAssetHistoricalPriceDto = { assetId?: number; date?: string };

export interface AssetHistoricalPriceCsvRow {
  date: string;
  price: string;
}
