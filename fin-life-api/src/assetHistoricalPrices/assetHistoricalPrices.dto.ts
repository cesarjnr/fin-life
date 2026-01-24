import { GetRequestParams } from 'src/common/dto/request';

export type GetAssetHistoricalPricesDto = GetRequestParams & {
  assetId: number;
};
export type FindAssetHistoricalPriceDto = { assetId: number; date?: string } | { date: string; assetId?: number };

export interface AssetHistoricalPriceCsvRow {
  date: string;
  price: string;
}
