import { Asset } from '../assets';

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

export enum BuySellTypes {
  Buy = 'buy',
  Sell = 'sell'
}

export async function getBuysSells(userId: number, walletId: number): Promise<BuySell[]> {
  const response = await fetch(`http://localhost:3000/users/${userId}/wallets/${walletId}/buys-sells`);
  const data: BuySell[] = await response.json();

  return data;
}