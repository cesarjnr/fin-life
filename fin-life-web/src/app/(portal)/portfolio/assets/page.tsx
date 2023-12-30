import { getUserWalletsAssets } from '@/api/wallets-assets';
import { formatCurrency } from '@/lib/currency';
import Table, { RowData } from '@/components/table';

export default async function Assets() {
  const walletsAssets = await getUserWalletsAssets(1, 1);
  const headers = [
    'Ticker',
    'Categoria',
    'Classe',
    'Setor',
    'Característica',
    '% Esperada na Classe',
    'Quantidade',
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
        walletAsset.area || 'N/A',
        walletAsset.characteristic || 'N/A',
        walletAsset.expectedPercentage || 'N/A',
        walletAsset.quantity,
        formatCurrency(walletAsset.asset.assetHistoricalPrices[0].closingPrice),
        formatCurrency(walletAsset.quantity * walletAsset.asset.assetHistoricalPrices[0].closingPrice)
      ];

      return {
        id: walletAsset.id,
        values: data
      }
    });

  return (
    <div className="self-center">
      <div className="p-6 rounded-xl bg-black-800">
        <Table
          headers={headers}
          rowsData={tableRowsData}
        />
      </div>
    </div>
  );
}
