import Chart, { ChartData } from '@/components/chart';

import { getUserWalletsAssets } from '../../../../api/wallets-assets';

export default async function Dashboard() {
  const walletsAssets = await getUserWalletsAssets(1, 1);
  const walletTotalValue = walletsAssets.reduce((walletValue, walletAsset) => {
    return walletValue += walletAsset.quantity * walletAsset.asset.assetHistoricalPrices[0].closingPrice;
  }, 0);
  const chartData: ChartData[] = walletsAssets.map((walletAsset) => ({
    id: walletAsset.asset.ticker,
    label: walletAsset.asset.ticker,
    value: Number(
      (
        (walletAsset.quantity * walletAsset.asset.assetHistoricalPrices[0].closingPrice / walletTotalValue).toFixed(4)
      )
    )
  }));

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex-1 flex gap-3">
        <div className="flex-1 flex flex-col gap-2 bg-black-800 p-2 rounded-lg">
          <h1 className="text-center">Carteira</h1>
          <Chart data={chartData} />
        </div>
        <div className="flex-1 flex flex-col gap-2 bg-black-800 p-2 rounded-lg">
          <h1 className="text-center">Carteira</h1>
          <Chart data={chartData} />
        </div>
      </div>
      <div className="flex-1 flex gap-3">
        <div className="flex-1 flex flex-col gap-2 bg-black-800 p-2 rounded-lg">
          <h1 className="text-center">Carteira</h1>
          <Chart data={chartData} />
        </div>
        <div className="flex-1 flex flex-col gap-2 bg-black-800 p-2 rounded-lg">
          <h1 className="text-center">Carteira</h1>
          <Chart data={chartData} />
        </div>
      </div>
    </div>
  );
}
