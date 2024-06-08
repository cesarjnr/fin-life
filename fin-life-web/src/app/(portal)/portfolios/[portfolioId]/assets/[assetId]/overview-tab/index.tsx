'use client'

import { PortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";
import { useModalContext } from "@/providers/modal";
import { formatCurrency } from "@/utils/currency";
import PortfolioAssetModal from "./portfolio-asset-modal";
import Button from "@/components/button";

interface PortfolioAssetOverviewTabProps {
  portfolioAsset: PortfolioAsset;
}

export default function PortfolioAssetOverviewTab({ portfolioAsset }: PortfolioAssetOverviewTabProps) {
  const { setShow } = useModalContext();
  const rows: [string, string][] = [
    ['Ticker', portfolioAsset.asset.ticker],
    ['Categoria', portfolioAsset.asset.category],
    ['Classe', portfolioAsset.asset.class],
    ['Característica', portfolioAsset.characteristic || 'N/A'],
    ['% Esperada na Classe', portfolioAsset.expectedPercentage ? `${portfolioAsset.expectedPercentage}%` : 'N/A'],
    ['Quantidade', String(portfolioAsset.quantity)],
    ['Custo', formatCurrency(portfolioAsset.cost)],
    ['Preço Médio', formatCurrency(portfolioAsset.averageCost)],
    ['Cotação', formatCurrency(portfolioAsset.asset.assetHistoricalPrices![0].closingPrice)],
    ['Posição', formatCurrency(portfolioAsset.quantity * portfolioAsset.asset.assetHistoricalPrices![0].closingPrice)]
  ];

  return (
    <>
      <div>
        <div className="flex justify-end">
          <Button
            color="primary"
            label="Editar"
            onClick={() => setShow(true)}
            variant="contained"
          />
        </div>

        <div className="flex flex-col gap-6">
          {rows.map((row, index) => (
            <div
              key={row[1]}
              className={`${index === rows.length -1 ? '' : 'border-b border-white/[.1]'} pb-6 flex items-center gap-24`}
            >
              <span className="w-1/12 font-bold">
                {row[0]}:
              </span>
              <span className="text-white/[.6]">
                {row[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PortfolioAssetModal
        portfolioAsset={portfolioAsset}
        title="Editar Ativo"
        onCancel={() => setShow(false)}
        onFinish={() => setShow(false)}
      />
    </>
  );
}