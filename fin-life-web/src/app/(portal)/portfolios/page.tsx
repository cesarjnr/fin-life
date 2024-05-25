'use client'

import { usePortfolioContext } from "@/providers/portfolio";
import { redirect } from "next/navigation";

export default function Portfolios() {
  const { selectedPortfolio } = usePortfolioContext();

  redirect(`/portfolios/${selectedPortfolio!.id}/dashboard`);

  return null;
}