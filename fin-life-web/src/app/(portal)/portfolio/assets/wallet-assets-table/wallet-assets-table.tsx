'use client'

import { WalletAsset } from '@/api/wallets-assets';
import Table, { RowData } from '@/components/table';
import { formatCurrency } from '@/lib/currency';

export interface WalletAssetsTableProps {
  walletsAssets: WalletAsset[];
}

export default function WalletAssetsTable({ walletsAssets }: WalletAssetsTableProps) {
  const headers = [
    'Ticker',
    'Categoria',
    'Classe',
    'Característica',
    '% Esperada na Classe',
    'Quantidade',
    'Custo',
    'Preço Médio',
    'Cotação',
    'Posição'
  ];
  const tableRowsData: RowData[] = walletsAssets
    .filter((walletAsset) => walletAsset.quantity)
    .map((walletAsset) => {
      const data = [
        walletAsset.asset.ticker,
        walletAsset.asset.category,
        walletAsset.asset.class,
        walletAsset.characteristic || 'N/A',
        walletAsset.expectedPercentage || 'N/A',
        walletAsset.quantity,
        formatCurrency(walletAsset.cost),
        formatCurrency(walletAsset.averageCost),
        formatCurrency(walletAsset.asset.assetHistoricalPrices![0].closingPrice),
        formatCurrency(walletAsset.quantity * walletAsset.asset.assetHistoricalPrices![0].closingPrice)
      ];

      return {
        id: walletAsset.id,
        values: data
      }
    });

  return (
    <div className="p-6 rounded-xl bg-black-800">
      <Table
        headers={headers}
        rowsData={tableRowsData}
      />
    </div>
  );
}