'use client'

import { useCallback, useEffect, useState } from 'react';

import { Asset } from '@/api/assets';
import { formatCurrency } from '@/lib/currency';
import { getAssetHistoricalPrices } from '@/api/asset-historical-prices';
import { getDividendHistoricalPayments } from '@/api/dividend-historical-payments';
import { getSplitHistoricalEvents } from '@/api/split-historical-events';
import Table, { RowData } from '@/components/table';
import Tab, { TabConfig } from '@/components/tab';

interface AssetDataProps {
  asset: Asset;
}
interface TableConfig {
  currentPage?: number;
  data: RowData[];
  headers: string[];
  itemsPerPage?: number;
  total?: number;
}

export default function AssetData({ asset }: AssetDataProps) {
  const [pricesTableConfig, setPricesTableConfig] = useState<TableConfig>({
    data: [],
    headers: ['Data','Preço']
  });
  const [dividendsTableConfig, setDividendsTableConfig] = useState<TableConfig>({
    data: [],
    headers: ['Data', 'Valor']
  });
  const [splitsTableConfig, setSplitsTableConfig] = useState<TableConfig>({
    data: [],
    headers: ['Data', 'Razão']
  });
  const tabs: TabConfig[] = [
    { id: 'prices', label: 'Cotações' },
    { id: 'dividends', label: 'Dividendos' },
    { id: 'splits', label: 'Desdobramentos' }
  ];
  const handleTabChange = (tab: TabConfig) => {
    switch (tab.id) {
      case 'prices':
        setupPricesTable();
        break;
      case 'dividends':
        setupDividendsTable();
        break;
      case 'splits':
        setupSplitsTable();
        break;
      default:
        break;
    }
  };
  const setupPricesTable = useCallback(
    async () => {
      const response = await getAssetHistoricalPrices({ assetId: asset.id });
      const tableData: RowData[] = response.data.map((assetHistoricalPrice) => {
        const data = [
          assetHistoricalPrice.date,
          formatCurrency(assetHistoricalPrice.closingPrice)
        ];

        return {
          id: assetHistoricalPrice.id,
          values: data
        };
      });

      setPricesTableConfig((prevState) => ({ ...prevState, data: tableData }));
    },
    [asset, setPricesTableConfig]
  );
  const setupDividendsTable = useCallback(
    async () => {
      const response = await getDividendHistoricalPayments({ assetId: asset.id });
      const tableData: RowData[] = response.data.map((dividendHistoricalPayment) => {
        const data = [
          dividendHistoricalPayment.date,
          formatCurrency(dividendHistoricalPayment.value)
        ];

        return {
          id: dividendHistoricalPayment.id,
          values: data
        };
      });

      setDividendsTableConfig((prevState) => ({ ...prevState, data: tableData }));
    },
    [asset, setDividendsTableConfig]
  );
  const setupSplitsTable = useCallback(
    async () => {
      const response = await getSplitHistoricalEvents({ assetId: asset.id });
      const tableData: RowData[] = response.data.map((splitHistoricalEvent) => {
        const data = [
          splitHistoricalEvent.date,
          splitHistoricalEvent.ratio
        ];

        return {
          id: splitHistoricalEvent.id,
          values: data
        };
      });

      setSplitsTableConfig((prevState) => ({ ...prevState, data: tableData }));
    },
    [asset, setSplitsTableConfig]
  );

  useEffect(() => {
    setupPricesTable();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="asset-data flex-1 bg-black-800 rounded-lg">
      <Tab onChange={handleTabChange} tabs={tabs}>
        <div data-id="prices">
          <Table
            headers={pricesTableConfig.headers}
            rowsData={pricesTableConfig.data}
          />
        </div>
        <div data-id="dividends">
          <Table
            headers={dividendsTableConfig.headers}
            rowsData={dividendsTableConfig.data}
          />
        </div>
        <div data-id="splits">
          <Table
            headers={splitsTableConfig.headers}
            rowsData={splitsTableConfig.data}
          />
        </div>
      </Tab>
    </div>
  )
}