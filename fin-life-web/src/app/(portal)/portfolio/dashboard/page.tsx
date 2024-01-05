import { getPortfolioOverview } from '@/api/wallets';
import { getUserWalletsAssets } from '@/api/wallets-assets';
import PortfolioOverview from './portfolio-overview';
import PortfolioData from './portfolio-data';

export default async function Dashboard() {
  const portfolioOverview = await getPortfolioOverview(1, 1);
  const walletsAssets = await getUserWalletsAssets(1, 1);

  return (
    <div className="flex-1 flex flex-col gap-5">
      <PortfolioOverview portfolioOverview={portfolioOverview} />
      <PortfolioData walletsAssets={walletsAssets} />
    </div>
  );
}
