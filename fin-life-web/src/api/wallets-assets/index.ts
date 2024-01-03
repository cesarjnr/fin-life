import { Asset } from '../assets';

export interface WalletAsset {
  id: number;
  asset: Asset;
  assetId: number;
  averageCost: number;
  characteristic?: string;
  cost: number;
  expectedPercentage?: number;
  lastSplitDate?: string;
  position: number;
  quantity: number;
  salesTotal: number;
  walletId: number;
}

export async function getUserWalletsAssets(userId: number, walletId: number): Promise<WalletAsset[]> {
  const response = await fetch(`http://localhost:3000/users/${userId}/wallets/${walletId}/wallets-assets`);
  const data: WalletAsset[] = await response.json();

  return data;
}