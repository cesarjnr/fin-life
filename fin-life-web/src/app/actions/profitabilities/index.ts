'use server'

import { PortfolioAssetProfitability } from "./profitability.types";

export async function getPortfolioAssetProfitability(
  userId: number,
  portfolioId: number,
  assetId: number
): Promise<PortfolioAssetProfitability> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/portfolios/${portfolioId}/profitabilities/assets/${assetId}`
  );
  const responseBody = await response.json();

  if (responseBody.message) {
    throw new Error(responseBody.message);
  }

  return responseBody as PortfolioAssetProfitability;
}
