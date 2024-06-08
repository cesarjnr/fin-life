'use client'

import { useCallback, useState } from "react";
import { useRouter } from 'next/navigation';

import { PortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";
import { portfolioAssetsTableHeaders } from "../loading";
import { formatCurrency } from "@/utils/currency";
import Table, { RowData } from "@/components/table";

interface PortfoliosAssetsTableProps {
  portfoliosAssets: PortfolioAsset[];
}

export default function PortfoliosAssetsTable({ portfoliosAssets }: PortfoliosAssetsTableProps) {
  const router = useRouter();
  const onTableRowClick = useCallback((rowData: RowData) => {
    router.push(`assets/${rowData.id}`);
  }, [router]);
  const tableRowsData: RowData[] = portfoliosAssets
    .filter((portfolioAsset) => portfolioAsset.quantity)
    .map((portfolioAsset) => {
      const data = [
        portfolioAsset.asset.ticker,
        portfolioAsset.asset.category,
        portfolioAsset.asset.class,
        portfolioAsset.quantity,
        formatCurrency(portfolioAsset.cost),
        formatCurrency(portfolioAsset.quantity * portfolioAsset.asset.assetHistoricalPrices![0].closingPrice)
      ];

      return {
        id: portfolioAsset.assetId,
        onClick: onTableRowClick,
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
    </>
  );
}
