export interface PortfolioOverview {
  currentBalance: number;
  investedBalance: number;
  profit: number;
  profitability: number;
}

export async function getPortfolioOverview(userId: number, walletId: number): Promise<PortfolioOverview> {
  const response = await fetch(`http://localhost:3000/users/${userId}/wallets/${walletId}/overview`);
  const data: PortfolioOverview = await response.json();

  return data;
}