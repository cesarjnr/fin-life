import { IsString } from 'class-validator';

export class PutPorfolioDto {
  @IsString()
  readonly description: string;
}

export interface PortfolioOverview {
  currentBalance: number;
  investedBalance: number;
  profit: number;
  profitability: number;
}

export interface PortfolioProfitability {
  total: number;
  annual: PeriodReturn;
  monthly: PeriodReturn;
}

export interface PeriodReturn {
  [key: string]: number;
}
