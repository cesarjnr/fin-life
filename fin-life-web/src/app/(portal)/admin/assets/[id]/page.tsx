import { findAsset } from '@/app/actions/assets';
import Tab, { TabConfig } from '@/components/tab';
import AssetOverviewTab from './overview-tab';
import AssetPricesTab from './prices-tab';
import AssetDividendsTab from './dividends-tab';
import AssetSplitsTab from './splits-tab';

interface AssetDetailsProps {
  params: {
    id: string;
  };
}

export const assetTabs: TabConfig[] = [
  { id: 'overview', label: 'Informações' },
  { id: 'prices', label: 'Cotações' },
  { id: 'dividends', label: 'Dividendos' },
  { id: 'splits', label: 'Desdobramentos' }
];

export default async function AssetDetails({ params }: AssetDetailsProps) {
  const asset = await findAsset(Number(params.id));

  return (
    <div className="asset-details flex-1 text-sm">
      <div className="bg-black-800 rounded-lg">
        <Tab tabs={assetTabs}>
          <div data-id="overview">
            <AssetOverviewTab asset={asset} />
          </div>
          <div data-id="prices">
            <AssetPricesTab asset={asset} />
          </div>
          <div data-id="dividends">
            <AssetDividendsTab asset={asset} />
          </div>
          <div data-id="splits">
            <AssetSplitsTab asset={asset} />
          </div>
        </Tab>
      </div>
    </div>
  );
}