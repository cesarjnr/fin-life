import { PortfolioOverview } from '@/api/wallets';
import { formatCurrency } from '@/lib/currency';

export interface PortfolioOverviewProps {
  portfolioOverview: PortfolioOverview;
}

export default function PortfolioOverview({ portfolioOverview }: PortfolioOverviewProps) {
  const formattedCurrentBalance = formatCurrency(portfolioOverview.currentBalance);
  const formattedInvestedBalance = formatCurrency(portfolioOverview.investedBalance);
  const formattedProfit = formatCurrency(portfolioOverview.profit);
  const formattedProfitability = `${(portfolioOverview.profitability * 100)}%`;

  return (
    <div className="flex gap-5">
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">Patrimônio</h1>
        <span className="text-white/[.6]">
          {formattedCurrentBalance}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">Valor Aplicado</h1>
        <span className="text-white/[.6]">{ formattedInvestedBalance }</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">Lucro</h1>
        <span className={`
          ${portfolioOverview.profit > 0 ? 'text-green-500' : 'text-red-500'}
        `}>
          { formattedProfit }
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 bg-black-800 p-4 rounded-lg">
        <h1 className="font-bold">Rentabilidade</h1>
        <span className={`
          ${portfolioOverview.profitability > 0 ? 'text-green-500' : 'text-red-500'}
        `}>
          { formattedProfitability }
        </span>
      </div>
    </div>
  );
}
