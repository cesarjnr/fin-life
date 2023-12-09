import { IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  readonly description: string;
}

export interface WalletOverview {
  balance: number;
  investedBalance: number;
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
