'use client'

import { useCallback, useLayoutEffect, useState } from 'react';

import { Asset } from '@/app/actions/assets/asset.types';
import { getAssetHistoricalPrices } from '@/api/asset-historical-prices';
import { formatCurrency } from '@/utils/currency';
import Table, { RowData, TablePagination } from '@/components/table';

interface AssetPricesTabProps {
  asset: Asset;
}
interface TableConfig {
  data: RowData[];
  headers: string[];
  name: string;
  pagination?: TablePagination;
}

export default function AssetPricesTab({ asset }: AssetPricesTabProps) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pricesTableConfig, setPricesTableConfig] = useState<TableConfig>({
    data: [],
    headers: ['Data','Preço'],
    name: 'prices'
  });
  const setupPricesTable = useCallback(
    async (page: number = 0, limit: number = 10) => {
      setIsTableLoading(true);

      const response = await getAssetHistoricalPrices({
        assetId: asset.id,
        page: String(page),
        limit: String(limit)
      });
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

      setPricesTableConfig((prevState) => ({
        ...prevState,
        data: tableData,
        pagination: {
          onPaginationChange: (_: string, page: number, rowsPerPage: number) => {
            setupPricesTable(page, rowsPerPage);
          },
          page: response.page,
          rowsPerPage: response.itemsPerPage,
          total: response.total
        }
      }));
      setIsTableLoading(false);
    },
    [asset]
  );

  useLayoutEffect(() => {
    setupPricesTable();
  }, [setupPricesTable]);

  return (
    <Table
      isLoading={isTableLoading}
      headers={pricesTableConfig.headers}
      name="prices"
      pagination={pricesTableConfig.pagination}
      rowsData={pricesTableConfig.data}
    />
  );
}