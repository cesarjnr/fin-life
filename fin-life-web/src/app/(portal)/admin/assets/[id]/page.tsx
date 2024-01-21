import { findAsset } from '@/api/assets';
import Tab, { TabConfig } from '@/components/tab';
import OverviewTab from './overview-tab';
import PricesTab from './prices-tab';
import DividendsTab from './dividends-tab';
import SplitsTab from './splits-tab';

interface AssetDetailsProps {
  params: {
    id: string;
  };
}

export const tabs: TabConfig[] = [
  { id: 'overview', label: 'Informações' },
  { id: 'prices', label: 'Cotações' },
  { id: 'dividends', label: 'Dividendos' },
  { id: 'splits', label: 'Desdobramentos' }
];

export default async function AssetDetails({ params }: AssetDetailsProps) {
  const asset = await findAsset(Number(params.id));

  return (
    <div className="asset-details flex-1">
      <div className="bg-black-800 rounded-lg">
        <Tab tabs={tabs}>
          <div data-id="overview">
            <OverviewTab asset={asset} />
          </div>
          <div data-id="prices">
            <PricesTab asset={asset} />
          </div>
          <div data-id="dividends">
            <DividendsTab asset={asset} />
          </div>
          <div data-id="splits">
            <SplitsTab asset={asset} />
          </div>
        </Tab>
      </div>
    </div>
  );
}