'use server'

import { GetPortfolioAssetProfitabilityParams, PortfolioAssetProfitability } from "./profitability.types";

export async function getPortfolioAssetProfitability(params: GetPortfolioAssetProfitabilityParams): Promise<PortfolioAssetProfitability> {
  const { assetId, portfolioId, userId, includeIndexes, interval } = params;
  const url = new URL(`http://localhost:3000/users/${userId}/portfolios/${portfolioId}/profitabilities/assets/${assetId}`);
  const urlSearchParams = new URLSearchParams();

  if (includeIndexes?.length) {
    includeIndexes.forEach((index) => {
      urlSearchParams.append('includeIndexes', index);
    });
  }

  if (interval) {
    urlSearchParams.append('interval', interval);
  }

  url.search = urlSearchParams.toString();

  const response = await fetch(url);
  const responseBody = await response.json();

  if (responseBody.message) {
    throw new Error(responseBody.message);
  }

  return responseBody as PortfolioAssetProfitability;
}
