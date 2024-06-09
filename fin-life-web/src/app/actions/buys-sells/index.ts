import { PaginationResponse } from "@/api/common/dto/pagination";
import { BuySell, CreateBuySell, GetBuysSellsParams } from "./buys-sells.types";
import { revalidateTag } from "next/cache";

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

  revalidateTag('buysSells');

  return body as BuySell;
}

export async function getBuysSells(params: GetBuysSellsParams): Promise<PaginationResponse<BuySell>> {
  const { userId, portfolioId, page, limit } = params;
  const url = new URL(`http://localhost:3000/users/${userId}/portfolios/${portfolioId}/buys-sells`);
  const urlSearchParams = new URLSearchParams();

  if (page) {
    urlSearchParams.append('page', page);
  }

  if (limit) {
    urlSearchParams.append('limit', limit);
  }

  url.search = urlSearchParams.toString();

  const response = await fetch(url, { next: { tags: ['buysSells'] } });
  const body = await response.json();

  return body as PaginationResponse<BuySell>;
}