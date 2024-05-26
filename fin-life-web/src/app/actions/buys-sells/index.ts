import { BuySell, CreateBuySell } from "./buys-sells.types";

export async function createBuySell(
  userId: number,
  portfolioId: number,
  createBuySell: CreateBuySell
): Promise<BuySell> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/portfolios/${portfolioId}/buys-sells`,
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(createBuySell)
    }
  );
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as BuySell;
}

export async function getBuysSells(userId: number, portfolioId: number): Promise<BuySell[]> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/portfolios/${portfolioId}/buys-sells`,
    { next: { tags: ['buysSells'] } }
  );
  const data: BuySell[] = await response.json();

  return data;
}