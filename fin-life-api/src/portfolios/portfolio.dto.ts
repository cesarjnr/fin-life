import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PutPorfolioDto {
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsBoolean()
  @IsOptional()
  readonly default: boolean;
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
