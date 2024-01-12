import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

export interface DividendHistoricalPayment {
  id: number;
  assetId: number;
  date: string;
  value: number;
}

export type GetDividendHistoricalPaymentsParams = {
  assetId: number
} & PaginationParams;

export async function getDividendHistoricalPayments(
  params: GetDividendHistoricalPaymentsParams
): Promise<PaginationResponse<DividendHistoricalPayment>> {
  const { assetId, page, limit } = params;
  const url = new URL(`http://localhost:3000/assets/${assetId}/dividend-historical-payments`);
  const urlSearchParams = new URLSearchParams();

  if (page) {
    urlSearchParams.append('page', page);
  }

  if (limit) {
    urlSearchParams.append('limit', limit);
  }

  url.search = urlSearchParams.toString();

  const response = await fetch(url);
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as PaginationResponse<DividendHistoricalPayment>;
}