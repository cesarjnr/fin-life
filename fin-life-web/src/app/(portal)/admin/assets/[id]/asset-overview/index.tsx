import { Asset } from '@/api/assets';

interface AssetOverviewProps {
  asset: Asset;
}

export default function AssetOverview({ asset }: AssetOverviewProps) {
  const overview: [string, string][] = [
    ['Ticker', asset.ticker],
    ['Categoria', asset.category],
    ['Classe', asset.class],
    ['Setor', asset.sector]
  ];

  return (
    <div className="asset-overview flex gap-5">
      {overview.map((data) => {
        const [label, value] = data;

        return (
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
            <span className="text-white/[.6]">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}