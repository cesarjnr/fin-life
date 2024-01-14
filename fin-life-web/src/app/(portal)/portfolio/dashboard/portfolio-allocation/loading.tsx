import { Skeleton } from '@mui/material';

import Table from '@/components/table';

export default function PortfolioAllocationSkeleton() {
  return (
    <div className="
      flex-1
      flex
      flex-col
      gap-5
      bg-black-800
      p-4
      rounded-lg
    ">
      <h1 className="text-center font-bold">
        Carteira
      </h1>
      <Skeleton
        height={52}
        sx={{ alignSelf: 'flex-end' }}
        variant="rounded"
        width={151}
      />
      <div className="flex-1 flex gap-3">
        <div className="flex-1 flex justify-center items-center">
          <Skeleton
            height={480}
            variant="circular"
            width={480}
          />
        </div>
        <div className="flex-1">
          <Table
            isLoading={true}
            headers={['Ticker', 'Posição (R$)', 'Posição (%)']}
            rowsData={[]}
          />
        </div>
      </div>
    </div>
  );
}