'use client'

import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';
import { Portfolio } from '@/app/actions/portfolios/portfolio.types';

interface PortfolioProviderProps {
  portfolios: Portfolio[];
  selectedPortfolio?: Portfolio;
  setPortfolios: Dispatch<SetStateAction<Portfolio[]>>;
  setSelectedPortfolio: Dispatch<SetStateAction<Portfolio>>;
}

export const PortfolioContext = createContext<PortfolioProviderProps>({
  portfolios: [],
  setPortfolios: () => {},
  setSelectedPortfolio: () => {}
});

export const PortfolioProvider = (
  {
    children,
    initialPortfolio,
    initialPortfolios
  }: 
  {
    children: React.ReactNode,
    initialPortfolio: Portfolio,
    initialPortfolios: Portfolio[]
  }
) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(initialPortfolio);

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      selectedPortfolio,
      setPortfolios,
      setSelectedPortfolio
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolioContext = () => useContext(PortfolioContext);