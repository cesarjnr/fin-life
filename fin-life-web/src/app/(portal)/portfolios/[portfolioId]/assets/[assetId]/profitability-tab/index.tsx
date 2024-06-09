import { PortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";

interface PortfolioAssetProfitabilityTabProps {
  portfolioAsset: PortfolioAsset;
}

export default function PortfolioAssetProfitabilityTab({ portfolioAsset }: PortfolioAssetProfitabilityTabProps) {
  console.log(portfolioAsset);

  return (
    <div>Profitability</div>
  );
}
