'use client'

import { useCallback, useLayoutEffect, useState } from 'react';

import { Asset } from '@/app/actions/assets/asset.types';
import { getDividendHistoricalPayments } from '@/api/dividend-historical-payments';
import { formatCurrency } from '@/utils/currency';
import Table, { RowData, TablePagination } from '@/components/table';

interface AssetDividendsTabProps {
  asset: Asset;
}
interface TableConfig {
  data: RowData[];
  headers: string[];
  name: string;
  pagination?: TablePagination;
}

export default function AssetDividendsTab({ asset }: AssetDividendsTabProps) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [dividendsTableConfig, setDividendsTableConfig] = useState<TableConfig>({
    data: [],
    headers: ['Data', 'Valor'],
    name: 'dividends'
  });
  const setupDividendsTable = useCallback(
    async (page: number = 0, itemsPerPage: number = 10) => {
      setIsTableLoading(true);

      const response = await getDividendHistoricalPayments({
        assetId: asset.id,
        page: String(page),
        limit: String(itemsPerPage)
      });
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

      setDividendsTableConfig((prevState) => ({
        ...prevState,
        data: tableData,
        pagination: {
          onPaginationChange: (_: string, page: number, rowsPerPage: number) => {
            setupDividendsTable(page, rowsPerPage);
          },
          page: response.page,
          rowsPerPage: response.itemsPerPage,
          total: response.total
        }
      }));
      setIsTableLoading(false);
    },
    [asset, setDividendsTableConfig]
  );

  useLayoutEffect(() => {
    setupDividendsTable();
  }, [setupDividendsTable]);

  return (
    <Table
      isLoading={isTableLoading}
      headers={dividendsTableConfig.headers}
      name="dividends"
      pagination={dividendsTableConfig.pagination}
      rowsData={dividendsTableConfig.data}
    />
  );
}
