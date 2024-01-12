import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

export interface SplitHistoricalEvent {
  id: number;
  assetId: number;
  date: string;
  denominator: number;
  numerator: number;
  ratio: string;
}
export type GetSplitHistoricalEventsParams = {
  assetId: number
} & PaginationParams;

export async function getSplitHistoricalEvents(
  params: GetSplitHistoricalEventsParams
): Promise<PaginationResponse<SplitHistoricalEvent>> {
  const { assetId, page, limit } = params;
  const url = new URL(`http://localhost:3000/assets/${assetId}/split-historical-events`);
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

  return body as PaginationResponse<SplitHistoricalEvent>;
}