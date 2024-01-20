import { Skeleton } from '@mui/material';

import { tabs } from './asset-data';
import Tab from '@/components/tab';
import Table from '@/components/table';

export default function AssetDetailsSkeleton() {
  const cardLabels = ['Ticker', 'Categoria', 'Classe', 'Setor'];

  return (
    <div className="h-full flex-1 flex flex-col gap-5">
      <div className="flex gap-5">
        {cardLabels.map((label) => (
          <div
            key={label}
            className="
              flex-1
              flex
              flex-col
              items-center
              gap-2
              bg-black-800
              p-4
              rounded-lg
            ">
            <h1 className="font-bold">
              {label}
            </h1>
            <Skeleton
              sx={{ fontSize: '1rem' }}
              width={120}
            />
          </div>
        ))}
      </div>
      <div className="flex-1 bg-black-800 rounded-lg">
        <Tab tabs={tabs}>
          <Table
            isLoading={true}
            headers={['Data', 'Preço']}
            rowsData={[]}
          />
        </Tab>
      </div>
    </div>
  )
}