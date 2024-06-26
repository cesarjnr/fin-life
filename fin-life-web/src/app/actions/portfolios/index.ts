'use server'

import { Portfolio, PortfolioOverview } from "./portfolio.types";

export async function getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
  const response = await fetch(`http://localhost:3000/users/${userId}/portfolios`, { next: { tags: ['portfolios'] } });

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as Portfolio[];
}

export async function getPortfolioOverview(userId: number, portfolioId: number): Promise<PortfolioOverview> {
  const response = await fetch(`http://localhost:3000/users/${userId}/portfolios/${portfolioId}/overview`);

  // await new Promise((resolve) => setTimeout(resolve, 6000));

  const data: PortfolioOverview = await response.json();

  return data;
}
