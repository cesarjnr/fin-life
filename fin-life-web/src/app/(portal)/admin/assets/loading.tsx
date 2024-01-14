import { Skeleton } from '@mui/material';
import Table from '@/components/table';

export const assetsTableHeaders = [
  'Ticker',
  'Categoria',
  'Classe',
  'Setor',
  'Ativo'
];

export default function AssetsSkeleton() {
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
          width={125}
        />
        <Table
          isLoading={true}
          headers={assetsTableHeaders}
          rowsData={[]}
        />
      </div>
    </div>
  );
}
