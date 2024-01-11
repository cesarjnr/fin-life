import { getUserWalletsAssets } from '@/api/wallets-assets';
import WalletAssetsTable from './wallet-assets-table/wallet-assets-table';

export default async function Assets() {
  const walletsAssets = await getUserWalletsAssets(1, 1);

  return (
    <div className="self-center">
      <WalletAssetsTable walletsAssets={walletsAssets} />
    </div>
  );
}
