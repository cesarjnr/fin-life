import { getPortfolioOverview } from '@/app/actions/portfolios';
import { formatCurrency } from '@/utils/currency';

export default async function PortfolioOverview() {
  const portfolioOverview = await getPortfolioOverview(1, 1);
  const customizedLabels = ['Lucro', 'Rentabilidade'];
  const overview: [string, number, string][] = [
    ['Patrimônio', portfolioOverview.currentBalance, formatCurrency(portfolioOverview.currentBalance)],
    ['Valor Aplicado', portfolioOverview.investedBalance, formatCurrency(portfolioOverview.investedBalance)],
    ['Lucro', portfolioOverview.profit, formatCurrency(portfolioOverview.profit)],
    ['Rentabilidade', portfolioOverview.profitability, `${(portfolioOverview.profitability * 100)}%`]
  ];

  return (
    <div className="portfolio-overview flex gap-5">
      {overview.map((data) => {
        const [label, rawValue, formattedValue] = data;

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
              <span className={
                `${customizedLabels.includes(label) ?
                    (rawValue === 0 ? 'text-white/[.6]' : (rawValue > 0 ? 'text-green-500' : 'text-red-500')) :
                    'text-white/[.6]'
                }`
              }>
                {formattedValue}
              </span>
          </div>
        )
      })}
    </div>
  );
}
