'use client'

import { useEffect, useMemo, useState } from 'react';

import Chart, { ChartData } from '@/components/chart';
import Input, { SelectOption } from '@/components/input';
import { WalletAsset } from '@/api/wallets-assets';
import Table, { RowData } from '@/components/table';
import { formatCurrency } from '@/lib/currency';

interface PortfolioDataProps {
  walletsAssets: WalletAsset[];
}

export default function PortfolioData({ walletsAssets }: PortfolioDataProps) {
  const groupByInputOptions: SelectOption[] = useMemo(() => [
    { label: 'Ticker', value: 'ticker' },
    { label: 'Categoria', value: 'category' },
    { label: 'Classe', value: 'class' }
  ], []);
  const [selectedInput, setSelectedInput] = useState(groupByInputOptions[0]);
  const [chartDataState, setChartData] = useState<ChartData[]>([]);
  const [tableHeadersState, setTableHeaders] = useState<string[]>([
    'Ticker',
    'Posição (R$)',
    'Posição (%)'
  ]);
  const [tableRowsDataState, setTableRowsData] = useState<RowData[]>([]);
  const walletTotalValue = walletsAssets.reduce((walletValue, walletAsset) => {
    return walletValue += walletAsset.quantity * walletAsset.asset.assetHistoricalPrices[0].closingPrice;
  }, 0);
  const positionByAssetMap = useMemo(() => new Map<string, number>([]), []);
  const positionByCategoryMap = useMemo(() => new Map<string, number>([]), []);
  const positionByClassMap = useMemo(() => new Map<string, number>([]), []);
  const positionsMap = useMemo(() => new Map<string, Map<string, number>>([
    [groupByInputOptions[0].value, positionByAssetMap],
    [groupByInputOptions[1].value, positionByCategoryMap],
    [groupByInputOptions[2].value, positionByClassMap]
  ]), [groupByInputOptions, positionByAssetMap, positionByCategoryMap, positionByClassMap]);
  const handleInputChange = (value: string) => {
    const input = groupByInputOptions.find((input) => input.value === value)!;

    setSelectedInput(input);
  };

  useEffect(() => {
    walletsAssets.forEach((walletAsset) => {
      const { quantity, asset } = walletAsset;
      const assetPosition = quantity * asset.assetHistoricalPrices[0].closingPrice;
      const correspondingCategoryPosition = positionByCategoryMap.get(asset.category);
      const correspondingClassPosition = positionByClassMap.get(asset.class);
  
      positionByAssetMap.set(walletAsset.asset.ticker, assetPosition);
      positionByCategoryMap.set(
        asset.category,
        (correspondingCategoryPosition || 0) + assetPosition
      );
      positionByClassMap.set(
        asset.class,
        (correspondingClassPosition || 0) + assetPosition
      );
    });
  }, [positionByAssetMap, positionByCategoryMap, positionByClassMap, walletsAssets]);

  useEffect(() => {
    const positionGroup = positionsMap.get(selectedInput.value)!;
    const chartData: ChartData[] = [];
    const tableHeaders: string[] = [
      selectedInput.label,
      'Posição (R$)',
      'Posição (%)'
    ];
    const tableData: RowData[] = [];

    positionGroup.forEach((position, group) => {
      const groupPositionPercentage = Number((position / walletTotalValue).toFixed(4));

      chartData.push({
        name: group,
        value: groupPositionPercentage
      });
      tableData.push({
        id: group,
        values: [group, formatCurrency(position), `${(groupPositionPercentage * 100).toFixed(2)}%`]
      });
    });

    setChartData(chartData);
    setTableHeaders(tableHeaders);
    setTableRowsData(tableData);
  }, [selectedInput, positionsMap, walletTotalValue]);

  return (
    <div className="flex-1 flex flex-col gap-2 bg-black-800 p-4 rounded-lg">
    <h1 className="text-center">Carteira</h1>
    <div className="self-end">
      <Input
        initialValue={selectedInput.value}
        name="groupBy"
        onChange={handleInputChange}
        placeholder="Group By"
        type="select"
        selectOptions={groupByInputOptions}
      />
    </div>
    <div className="flex gap-3">
      <div className="flex-1">
        <Chart data={chartDataState} />
      </div>
      <div className="flex-1">
        <Table headers={tableHeadersState} rowsData={tableRowsDataState}/>
      </div>
    </div>
  </div>
  );
}
