'use client'

import { useCallback, useLayoutEffect, useState } from 'react';

import { Asset } from '@/api/assets';
import { getSplitHistoricalEvents } from '@/api/split-historical-events';
import Table, { RowData, TablePagination } from '@/components/table';

interface SplitsTabProps {
  asset: Asset;
}
interface TableConfig {
  data: RowData[];
  headers: string[];
  name: string;
  pagination?: TablePagination;
}

export default function SplitsTab({ asset }: SplitsTabProps) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [splitsTableConfig, setSplitsTableConfig] = useState<TableConfig>({
    data: [],
    headers: ['Data', 'Razão'],
    name: 'splits'
  });
  const setupSplitsTable = useCallback(
    async (page: number = 0, itemsPerPage: number = 10) => {
      setIsTableLoading(true);

      const response = await getSplitHistoricalEvents({
        assetId: asset.id,
        page: String(page),
        limit: String(itemsPerPage)
      });
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

      setSplitsTableConfig((prevState) => ({
        ...prevState,
        data: tableData,
        pagination: {
          onPaginationChange: (_: string, page: number, rowsPerPage: number) => {
            setupSplitsTable(page, rowsPerPage);
          },
          page: response.page,
          rowsPerPage: response.itemsPerPage,
          total: response.total
        }
      }));
      setIsTableLoading(false);
    },
    [asset, setSplitsTableConfig]
  );

  useLayoutEffect(() => {
    setupSplitsTable();
  }, [setupSplitsTable]);


  return (
    <Table
      isLoading={isTableLoading}
      headers={splitsTableConfig.headers}
      name="splits"
      pagination={splitsTableConfig.pagination}
      rowsData={splitsTableConfig.data}
    />
  );
}
