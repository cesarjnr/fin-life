import { Skeleton } from '@mui/material';

export default function PortfolioOverviewSkeleton() {
  const cardLabels = ['Patrimônio', 'Valor Aplicado', 'Lucro', 'Rentabilidade'];

  return (
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
  )
}