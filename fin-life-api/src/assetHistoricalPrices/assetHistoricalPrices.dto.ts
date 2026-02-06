import { GetRequestParams } from '../common/dto/request';

export type GetAssetHistoricalPricesDto = GetRequestParams & {
  assetId: number;
};
export type FindAssetHistoricalPriceDto = { assetId?: number; date?: string };

export interface AssetHistoricalPriceCsvRow {
  date: string;
  price: string;
}
