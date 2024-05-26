'use client'

import { redirect } from "next/navigation";

import { usePortfolioContext } from "@/providers/portfolio";

export default function Portfolios() {
  const { selectedPortfolio } = usePortfolioContext();

  redirect(`/portfolios/${selectedPortfolio!.id}/dashboard`);
}
