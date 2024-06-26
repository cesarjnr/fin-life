'use server'

import { revalidateTag } from "next/cache";

import { PortfolioAsset, UpdatePortfolioAsset } from "./portfolio-asset.types";

export async function getPortfoliosAssets(userId: number, portfolioId: number): Promise<PortfolioAsset[]> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/portfolios/${portfolioId}/assets`,
    { next: { tags: ['portfoliosAssets'] } }
  );

  // await new Promise((resolve) => setTimeout(resolve, 6000));

  const data: PortfolioAsset[] = await response.json();

  return data;
}

export async function findPortfolioAsset(
  userId: number,
  portfolioId: number,
  assetId: number
): Promise<PortfolioAsset> {
  const response = await fetch(`http://localhost:3000/users/${userId}/portfolios/${portfolioId}/assets/${assetId}`, { next: { tags: ['portfoliosAssets'] } });

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const data: PortfolioAsset = await response.json();

  return data;
}

export async function updatePortfolioAsset(
  userId: number,
  portfolioId: number,
  assetId: number,
  payload: UpdatePortfolioAsset
): Promise<PortfolioAsset> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/portfolios/${portfolioId}/assets/${assetId}`,
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
      body: JSON.stringify(payload)
    }
  );
  const responseBody = await response.json();

  if (responseBody.message) {
    throw new Error(responseBody.message);
  }

  revalidateTag('portfoliosAssets');

  return responseBody as PortfolioAsset;
}
