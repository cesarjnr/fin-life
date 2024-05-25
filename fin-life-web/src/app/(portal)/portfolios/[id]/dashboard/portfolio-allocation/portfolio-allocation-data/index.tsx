'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';

import { WalletAsset } from '@/api/wallets-assets'
import { SelectOption } from '@/components/input/select-input';
import { formatCurrency } from '@/utils/currency';
import Chart, { ChartData } from '@/components/chart';
import Table, { RowData } from '@/components/table';
import Input from '@/components/input';

interface PortfolioAllocationDataProps {
  walletsAssets: WalletAsset[];
}

const groupByInputOptions: SelectOption[] = [
  { label: 'Ticker', value: 'ticker' },
  { label: 'Categoria', value: 'category' },
  { label: 'Classe', value: 'class' },
  { label: 'Setor', value: 'sector' }
];
const positionByAssetMap = new Map<string, number>([]);
const positionByCategoryMap = new Map<string, number>([]);
const positionByClassMap = new Map<string, number>([]);
const positionBySectorMap = new Map<string, number>([]);
const positionsByGroupMap = new Map<string, Map<string, number>>([
  [groupByInputOptions[0].value, positionByAssetMap],
  [groupByInputOptions[1].value, positionByCategoryMap],
  [groupByInputOptions[2].value, positionByClassMap],
  [groupByInputOptions[3].value, positionBySectorMap]
]);

export default function PortfolioAllocationData({ walletsAssets }: PortfolioAllocationDataProps) {
  const [isDataBeingSetup, setIsDataBeingSetup] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>(['Ticker', 'Posição (R$)', 'Posição (%)']);
  const [tableRowsData, setTableRowsData] = useState<RowData[]>([]);
  const walletTotalValue = useMemo(
    () => (
      walletsAssets.reduce((walletValue, walletAsset) => {
        return walletValue += walletAsset.quantity * walletAsset.asset.assetHistoricalPrices![0].closingPrice;
        }, 0)
    ),
    [walletsAssets]
  );
  const setupPositionsByGroup = useCallback(
    () => {
      walletsAssets.forEach((walletAsset) => {
        const { quantity, asset } = walletAsset;
        const assetPosition = quantity * asset.assetHistoricalPrices![0].closingPrice;
        const correspondingCategoryPosition = positionByCategoryMap.get(asset.category);
        const correspondingClassPosition = positionByClassMap.get(asset.class);
        const correspondingSectorPosition = positionByClassMap.get(asset.sector);
    
        positionByAssetMap.set(walletAsset.asset.ticker, assetPosition);
        positionByCategoryMap.set(
          asset.category,
          (correspondingCategoryPosition || 0) + assetPosition
        );
        positionByClassMap.set(
          asset.class,
          (correspondingClassPosition || 0) + assetPosition
        );
        positionBySectorMap.set(
          asset.sector,
          (correspondingSectorPosition || 0) + assetPosition
        );
      });
    },
    [walletsAssets]
  );
  const setupChartAndTableData = useCallback(
    (groupBy: string) => {
      const groupPosition = positionsByGroupMap.get(groupBy)!;
      const groupLabel = groupByInputOptions.find((option) => option.value === groupBy)!.label;
      const chartData: ChartData[] = [];
      const tableHeaders: string[] = [groupLabel, 'Posição (R$)', 'Posição (%)'];
      const tableData: RowData[] = [];

      groupPosition.forEach((position, group) => {
        const groupPositionPercentage = Number((position / walletTotalValue).toFixed(4));

        chartData.push({
          name: group,
          value: groupPositionPercentage
        });
        tableData.push({
          id: group,
          values: [group, formatCurrency(position), `${(groupPositionPercentage * 100).toFixed(2)}%`],
        });
      });

      setChartData(chartData);
      setTableHeaders(tableHeaders);
      setTableRowsData(tableData);
    },
    [walletTotalValue]
  );

  useEffect(() => {
    setIsDataBeingSetup(true);
    setupPositionsByGroup();
    setupChartAndTableData('ticker');
    setIsDataBeingSetup(false);
  }, [setupPositionsByGroup, setupChartAndTableData]);

  return (
    <div className="
      portfolio-allocation-data
      flex-1
      flex
      flex-col
      items-end
    ">
      <Input
        name="groupBy"
        options={groupByInputOptions}
        onChange={setupChartAndTableData}
        placeholder="Agrupar por"
        type="select"
      />
      <div className="self-stretch flex-1 flex gap-3">
        <div className="flex-1">
          <Chart data={chartData} />
        </div>
        <div className="flex-1">
          <Table
            headers={tableHeaders}
            isLoading={isDataBeingSetup}
            name="portfolioAllocation"
            rowsData={tableRowsData}
          />
        </div>
      </div>
    </div>
  );
}
