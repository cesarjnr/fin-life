import { PortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";
import { getPortfolioAssetProfitability } from "@/app/actions/profitabilities";
import { LineChartData } from "@/components/chart/line-chart";
import { formatDate } from "@/utils/date";
import Chart from "@/components/chart";

interface PortfolioAssetProfitabilityTabProps {
  portfolioAsset: PortfolioAsset;
}

export default async function PortfolioAssetProfitabilityTab({ portfolioAsset }: PortfolioAssetProfitabilityTabProps) {
  const { timestamps, values } = await getPortfolioAssetProfitability(1, portfolioAsset.portfolioId, portfolioAsset.assetId);
  const chartData: LineChartData = {
    keys: ['WEGE3'],
    data: []
  };

  timestamps.forEach((timestamp, index) => {
    chartData.data.push({
      name: formatDate(timestamp),
      values: {
        [portfolioAsset.asset.ticker]: values[index]
      }
    });
  });

  return <Chart data={chartData} type="line" />;
}
