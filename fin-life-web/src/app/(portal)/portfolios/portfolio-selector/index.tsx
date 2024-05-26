'use client'

import { usePathname, useRouter } from "next/navigation";

import { SelectOption } from "@/components/input/select-input";
import { usePortfolioContext } from "@/providers/portfolio";
import Input from "@/components/input";

export default function PortfolioSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { portfolios, selectedPortfolio, setSelectedPortfolio } = usePortfolioContext();
  const portfolioInputOptions: SelectOption[] = portfolios.map((portfolio) => ({
    label: portfolio.description,
    value: String(portfolio.id)
  }));
  const handlePortfolioInputChange = (value: string) => {
    const portfolioId = Number(value);
    const portfolio = portfolios.find((portfolio) => portfolio.id === portfolioId)!;
    const newPath = pathname.replace(/[0-9]/, String(portfolio!.id));
    
    setSelectedPortfolio(portfolio);
    router.push(newPath);
  };

  return (
    <Input
      initialValue={String(selectedPortfolio!.id)}
      name="portfolio"
      onChange={handlePortfolioInputChange}
      options={portfolioInputOptions}
      placeholder="Carteira"
      type="select"
    />
  );
}
