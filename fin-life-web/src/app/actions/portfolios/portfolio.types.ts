export interface Portfolio {
  id: number;
  description: string;
  userId: number;
}
export interface PortfolioOverview {
  currentBalance: number;
  investedBalance: number;
  profit: number;
  profitability: number;
}
