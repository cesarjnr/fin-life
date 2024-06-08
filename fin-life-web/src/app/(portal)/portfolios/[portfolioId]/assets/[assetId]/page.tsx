import { findPortfolioAsset } from "@/app/actions/portfolios-assets";
import Tab, { TabConfig } from "@/components/tab";
import PortfolioAssetOverviewTab from "./overview-tab";

interface PortfolioAssetDetailsProps {
  params: {
    assetId: string;
    portfolioId: string;
  };
}
export const portfolioAssetTabs: TabConfig[] = [
  { id: 'overview', label: 'Informações' },
  // { id: 'prices', label: 'Cotações' },
  // { id: 'dividends', label: 'Dividendos' },
  // { id: 'splits', label: 'Desdobramentos' }
];

export default async function PortfolioAssetDetails({ params }: PortfolioAssetDetailsProps) {
  const portfolioAsset = await findPortfolioAsset(
    1,
    Number(params.portfolioId),
    Number(params.assetId),
    { relations: ['asset.assetHistoricalPrices'] }
  );

  return (
    <div className="asset-details flex-1">
      <div className="bg-black-800 rounded-lg">
        <Tab tabs={portfolioAssetTabs}>
          <div data-id="overview">
            <PortfolioAssetOverviewTab portfolioAsset={portfolioAsset} />
          </div>
        </Tab>
      </div>
    </div>
  );
}
