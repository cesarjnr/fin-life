import { Asset } from '../assets';

export interface WalletAsset {
  id: number;
  area: string | null;
  asset: Asset;
  assetId: number;
  characteristic: string | null;
  cost: number;
  expectedPercentage: number | null;
  quantity: number;
  walletId: number;
}

export async function getUserWalletsAssets(userId: number, walletId: number): Promise<WalletAsset[]> {
  const response = await fetch(`http://localhost:3000/users/${userId}/wallets/${walletId}/wallets-assets`);
  const data: WalletAsset[] = await response.json();

  return data;
}