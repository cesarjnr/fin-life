import { PortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";
import { getMarketIndexesOverview } from "@/app/actions/market-index-historical-data";
import { getPortfolioAssetProfitability } from "@/app/actions/profitabilities";
import { LineChartData } from "@/components/chart/line-chart";
import { SelectOption } from "@/components/input/select-input";
import { formatDate } from "@/utils/date";
import Input from "@/components/input";
import Chart from "@/components/chart";
import { DataIntervals } from "@/utils/enums";

interface PortfolioAssetProfitabilityTabProps {
  portfolioAsset: PortfolioAsset;
}

export default async function PortfolioAssetProfitabilityTab({ portfolioAsset }: PortfolioAssetProfitabilityTabProps) {
  const marketIndexesOverview = await getMarketIndexesOverview();
  const { timestamps, values } = await getPortfolioAssetProfitability({
    assetId: portfolioAsset.assetId,
    includeIndexes: ['cdi'],
    interval: DataIntervals.Daily,
    portfolioId: portfolioAsset.portfolioId,
    userId: 1
  });
  const chartData: LineChartData = {
    keys: ['WEGE3', 'CDI'],
    data: []
  };
  const marketIndexInputOptions: SelectOption[] = marketIndexesOverview.map((marketIndex) => ({
    label: marketIndex.ticker,
    value: marketIndex.ticker
  }));

  timestamps.forEach((timestamp, index) => {
    chartData.data.push({
      name: formatDate(timestamp),
      values: {
        [portfolioAsset.asset.ticker]: values[portfolioAsset.asset.ticker][index],
        'CDI': values['CDI'][index]
      }
    });
  });

  return (
    <div className="profitability-tab h-full flex flex-col gap-5">
      {/* <div className="flex justify-end">
        <Input
          initialValue={marketIndexInputOptions[0]?.value}
          name="marketIndex"
          options={marketIndexInputOptions}
          placeholder="Index"
          type="select"
        />
      </div> */}
      <Chart data={chartData} type="line" />
    </div>
  );
}
