'use client'

import { useState } from "react";
import { MdEdit } from "react-icons/md";

import { PortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";
import { useModalContext } from "@/providers/modal";
import { portfolioAssetsTableHeaders } from "../loading";
import { formatCurrency } from "@/utils/currency";
import Table, { RowData } from "@/components/table";
import PortfoliosAssetsModal from "../portfolios-assets-modal";

interface PortfoliosAssetsTableProps {
  portfoliosAssets: PortfolioAsset[];
}

export default function PortfoliosAssetsTable({ portfoliosAssets }: PortfoliosAssetsTableProps) {
  const [selectedPortfolioAsset, setSelectedPortfolioAsset] = useState<PortfolioAsset>();
  const { setShow } = useModalContext();
  const handleEditIconButtonClick = (portfolioAsset: PortfolioAsset) => {
    setSelectedPortfolioAsset(portfolioAsset);
    setShow(true);
  };
  const tableRowsData: RowData[] = portfoliosAssets
    .filter((portfolioAsset) => portfolioAsset.quantity)
    .map((portfolioAsset) => {
      const editIconComponent = <MdEdit
        size={22}
        color="#00e663"
        className="cursor-pointer"
        onClick={() => handleEditIconButtonClick(portfolioAsset)} />
      const data = [
        portfolioAsset.asset.ticker,
        portfolioAsset.asset.category,
        portfolioAsset.asset.class,
        portfolioAsset.characteristic || 'N/A',
        portfolioAsset.expectedPercentage ? `${portfolioAsset.expectedPercentage}%` : 'N/A',
        portfolioAsset.quantity,
        formatCurrency(portfolioAsset.cost),
        formatCurrency(portfolioAsset.averageCost),
        formatCurrency(portfolioAsset.asset.assetHistoricalPrices![0].closingPrice),
        formatCurrency(portfolioAsset.quantity * portfolioAsset.asset.assetHistoricalPrices![0].closingPrice),
        editIconComponent
      ];

      return {
        id: portfolioAsset.id,
        values: data
      }
    });

  return (
    <>
      <Table
        headers={portfolioAssetsTableHeaders}
        name="portfoliosAssets"
        rowsData={tableRowsData}
      />

      <PortfoliosAssetsModal
        portfolioAsset={selectedPortfolioAsset}
        title="Editar Ativo"
        onCancel={() => setShow(false)}
        onFinish={() => setShow(false)}
      />
    </>
  );
}
