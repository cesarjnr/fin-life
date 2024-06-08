import { headers } from 'next/dist/client/components/headers';

import { getPortfoliosAssets } from '@/app/actions/portfolios-assets';
import PortfoliosAssetsTable from './portfolios-assets-table';

export default async function Assets() {
  const headersList = headers();
  const pathname = headersList.get('x-current-path');
  const [portfolioId] = pathname!.match(/[0-9]/)!;
  const portfoliosAssets = await getPortfoliosAssets(1, Number(portfolioId));

  return (
    <div className="portfolio-assets">
      <div className="p-6 rounded-xl bg-black-800 min-w-[50vw]">
        <PortfoliosAssetsTable portfoliosAssets={portfoliosAssets} />
      </div>
    </div>
  );
}
