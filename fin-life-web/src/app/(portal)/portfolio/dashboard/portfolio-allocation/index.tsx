import { getUserWalletsAssets } from '@/api/wallets-assets';
import PortfolioAllocationData from './portfolio-allocation-data';

export default async function PortfolioAllocation() {
  const walletsAssets = await getUserWalletsAssets(1, 1);

  return (
    <div className="
      portfolio-allocation
      flex-1
      flex
      flex-col
      gap-4
      bg-black-800
      p-4
      rounded-lg
    ">
      <h1 className="text-center font-bold">
        Carteira
      </h1>
      <PortfolioAllocationData walletsAssets={walletsAssets} />
    </div>
  );
}
