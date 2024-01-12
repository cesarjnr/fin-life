import { Asset } from '@/api/assets';

interface AssetOverviewProps {
  asset: Asset;
}

export default function AssetOverview({ asset }: AssetOverviewProps) {
  return (
    <div className="asset-overview flex gap-5">
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">
          Ticker
        </h1>
        <span className="text-white/[.6]">
          {asset.ticker}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">
          Categoria
        </h1>
        <span className="text-white/[.6]">
          {asset.category}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">
          Classe
        </h1>
        <span className="text-white/[.6]">
          {asset.class}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">
          Setor
        </h1>
        <span className="text-white/[.6]">
          {asset.sector}
        </span>
      </div>
    </div>
  );
}