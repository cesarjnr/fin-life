import { Asset } from '../../app/actions/assets';

export interface CreateBuySell {
  assetId: number;
  date: string;
  fees?: number;
  institution: string;
  price: number;
  quantity: number;
  type: BuySellTypes;
}
export interface BuySell {
  id: number;
  asset: Asset;
  assetId: number;
  date: string;
  fees: number | null;
  institution: string;
  price: number;
  quantity: number;
  type: BuySellTypes;
  walletId: number;
}
export interface ErrorResponse {
  message: string;
  statusCode: number;
}

export enum BuySellTypes {
  Buy = 'buy',
  Sell = 'sell'
}

export async function createBuySell(
  userId: number,
  walletId: number,
  createBuySell: CreateBuySell
): Promise<BuySell> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/wallets/${walletId}/buys-sells`,
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

export async function getBuysSells(userId: number, walletId: number): Promise<BuySell[]> {
  const response = await fetch(
    `http://localhost:3000/users/${userId}/wallets/${walletId}/buys-sells`,
    { next: { tags: ['buysSells'] } }
  );
  const data: BuySell[] = await response.json();

  return data;
}