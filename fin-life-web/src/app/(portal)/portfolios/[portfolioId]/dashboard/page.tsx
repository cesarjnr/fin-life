import { Suspense } from 'react';
import { headers } from 'next/dist/client/components/headers';

import PortfolioOverview from './portfolio-overview';
import PortfolioAllocation from './portfolio-allocation';
import PortfolioOverviewSkeleton from './portfolio-overview/loading';
import PortfolioAllocationSkeleton from './portfolio-allocation/loading';

export default function Dashboard() {
  const headersList = headers();
  const pathname = headersList.get('x-current-path');
  const [portfolioId] = pathname!.match(/[0-9]/)!;

  return (
    <div className="dashboard h-full flex-1 flex flex-col gap-5 text-sm">
      <Suspense fallback={<PortfolioOverviewSkeleton />}>
        <PortfolioOverview portfolioId={Number(portfolioId)} />
      </Suspense>
      <Suspense fallback={<PortfolioAllocationSkeleton />}>
        <PortfolioAllocation portfolioId={Number(portfolioId)} />
      </Suspense>
    </div>
  );
}
