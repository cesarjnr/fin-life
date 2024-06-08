import { getPortfoliosAssets } from '@/app/actions/portfolios-assets';
import PortfolioAllocationData from './portfolio-allocation-data';

interface PortfolioAllocationProps {
  portfolioId: number;
}

export default async function PortfolioAllocation({ portfolioId }: PortfolioAllocationProps) {
  const portfoliosAssets = await getPortfoliosAssets(1, portfolioId);

  return (
    <div className="
      portfolio-allocation
      flex-1
      flex
      flex-col
      gap-4
      bg-black-800
      p-4
      rounded-lg
    ">
      <h1 className="text-center font-bold">
        Carteira
      </h1>
      <PortfolioAllocationData portfoliosAssets={portfoliosAssets} />
    </div>
  );
}
