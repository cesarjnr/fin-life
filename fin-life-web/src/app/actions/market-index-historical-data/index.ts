import { MarketIndexOverview } from "./market-index-historical-data.types";

export async function getMarketIndexesOverview(): Promise<MarketIndexOverview[]> {
  const response = await fetch(
    'http://localhost:3000/market-index-historical-data/overview',
    { next: { tags: ['marketIndexes'] } }
  );
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as MarketIndexOverview[];
}