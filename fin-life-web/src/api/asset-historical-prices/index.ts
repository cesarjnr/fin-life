import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

export interface AssetHistoricalPrice {
  id: number;
  assetId: number;
  closingPrice: number;
  date: string;
}

export type GetAssetHistoricalPricesParams = {
  assetId: number
} & PaginationParams;

export async function getAssetHistoricalPrices(
  params: GetAssetHistoricalPricesParams
): Promise<PaginationResponse<AssetHistoricalPrice>> {
  const { assetId, page, limit } = params;
  const url = new URL(`http://localhost:3000/assets/${assetId}/asset-historical-prices`);
  const urlSearchParams = new URLSearchParams();

  if (page) {
    urlSearchParams.append('page', page);
  }

  if (limit) {
    urlSearchParams.append('limit', limit);
  }

  url.search = urlSearchParams.toString();

  const response = await fetch(url);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as PaginationResponse<AssetHistoricalPrice>;
}
