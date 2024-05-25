import { Suspense } from 'react';

import PortfolioOverview from './portfolio-overview';
import PortfolioAllocation from './portfolio-allocation';
import PortfolioOverviewSkeleton from './portfolio-overview/loading';
import PortfolioAllocationSkeleton from './portfolio-allocation/loading';

export default function Dashboard() {
  return (
    <div className="dashboard h-full flex-1 flex flex-col gap-5">
      <Suspense fallback={<PortfolioOverviewSkeleton />}>
        <PortfolioOverview />
      </Suspense>
      <Suspense fallback={<PortfolioAllocationSkeleton />}>
        <PortfolioAllocation />
      </Suspense>
    </div>
  );
}
