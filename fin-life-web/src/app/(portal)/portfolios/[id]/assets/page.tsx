import { formatCurrency } from '@/utils/currency';
import { portfolioAssetsTableHeaders } from './loading';
import Table, { RowData } from '@/components/table';
import getPortfoliosAssets from '@/app/actions/portfolios';

export default async function Assets() {
  const portfoliosAssets = await getPortfoliosAssets(1, 1);
  const tableRowsData: RowData[] = portfoliosAssets
    .filter((portfolioAsset) => portfolioAsset.quantity)
    .map((portfolioAsset) => {
      const data = [
        portfolioAsset.asset.ticker,
        portfolioAsset.asset.category,
        portfolioAsset.asset.class,
        portfolioAsset.characteristic || 'N/A',
        portfolioAsset.expectedPercentage || 'N/A',
        portfolioAsset.quantity,
        formatCurrency(portfolioAsset.cost),
        formatCurrency(portfolioAsset.averageCost),
        formatCurrency(portfolioAsset.asset.assetHistoricalPrices![0].closingPrice),
        formatCurrency(portfolioAsset.quantity * portfolioAsset.asset.assetHistoricalPrices![0].closingPrice)
      ];

      return {
        id: portfolioAsset.id,
        values: data
      }
    });

  return (
    <div className="portfolio-assets self-center">
      <div className="p-6 rounded-xl bg-black-800 min-w-[50vw]">
        <Table
          headers={portfolioAssetsTableHeaders}
          name="portfoliosAssets"
          rowsData={tableRowsData}
        />
      </div>
    </div>
  );
}
