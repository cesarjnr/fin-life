import { getUserWalletsAssets } from '@/api/wallets-assets';
import { formatCurrency } from '@/utils/currency';
import { portfolioAssetsTableHeaders } from './loading';
import Table, { RowData } from '@/components/table';

export default async function Assets() {
  const walletsAssets = await getUserWalletsAssets(1, 1);
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
    <div className="portfolio-assets self-center">
      <div className="p-6 rounded-xl bg-black-800 min-w-[50vw]">
        <Table
          headers={portfolioAssetsTableHeaders}
          name="walletAssets"
          rowsData={tableRowsData}
        />
      </div>
    </div>
  );
}
