import { IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  readonly description: string;
}

export interface WalletOverview {
  currentBalance: number;
  investedBalance: number;
  profit: number;
  profitability: number;
}

export interface WalletProfitability {
  total: number;
  annual: PeriodReturn;
  monthly: PeriodReturn;
}

export interface PeriodReturn {
  [key: string]: number;
}
