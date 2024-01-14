import { Skeleton } from '@mui/material';

import Table from '@/components/table';

export const transactionsTableHeaders = [
  'Data',
  'Ativo',
  'Ação',
  'Preço',
  'Quantidade',
  'Total'
];

export default function TransactionsSkeleton() {
  return (
    <div className="self-center">
      <div className="
        p-6
        rounded-xl
        bg-black-800
        flex
        flex-col
        gap-8
        min-w-[50vw]
      ">
        <Skeleton
          height={40}
          sx={{ alignSelf: 'flex-end' }}
          variant="rounded"
          width={203}
        />
        <Table
          isLoading={true}
          headers={transactionsTableHeaders}
          rowsData={[]}
        />
      </div>
    </div>
  );
}