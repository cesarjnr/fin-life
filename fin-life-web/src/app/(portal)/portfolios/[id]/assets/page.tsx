import { headers } from 'next/dist/client/components/headers';

import { formatCurrency } from '@/utils/currency';
import { portfolioAssetsTableHeaders } from './loading';
import { getPortfoliosAssets } from '@/app/actions/portfolios';
import Table, { RowData } from '@/components/table';

export default async function Assets() {
  const headersList = headers();
  const pathname = headersList.get('x-current-path');
  const [portfolioId] = pathname!.match(/[0-9]/)!;
  const portfoliosAssets = await getPortfoliosAssets(1, Number(portfolioId));
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
    <div className="portfolio-assets">
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
