'use client'

import { SelectOption } from "@/components/input/select-input";
import { usePortfolioContext } from "@/providers/portfolio";
import Input from "@/components/input";

export default function PortfolioSelector() {
  const { portfolios, selectedPortfolio } = usePortfolioContext();
  const portfolioInputOptions: SelectOption[] = portfolios.map((portfolio) => ({
    label: portfolio.description,
    value: String(portfolio.id)
  }));

  return (
    <Input
      initialValue={String(selectedPortfolio!.id)}
      name="portfolio"
      options={portfolioInputOptions}
      placeholder="Carteira"
      type="select"
    />
  );
}
