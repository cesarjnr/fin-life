import { getPortfolioOverview } from '@/api/wallets';
import { getUserWalletsAssets } from '@/api/wallets-assets';
import PortfolioOverview from './portfolio-overview';
import PortfolioComposition from './portfolio-composition';

export default async function Dashboard() {
  const [portfolioOverview, walletsAssets] = await Promise.all([getPortfolioOverview(1, 1), getUserWalletsAssets(1, 1)]);

  return (
    <div className="flex-1 flex flex-col gap-5">
      <PortfolioOverview portfolioOverview={portfolioOverview} />
      <PortfolioComposition walletsAssets={walletsAssets} />
    </div>
  );
}
