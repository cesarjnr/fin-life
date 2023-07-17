import { IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  readonly description: string;
}

export interface WalletProfitability {
  total: number;
  annual: PeriodReturn;
  monthly: PeriodReturn;
}

export interface PeriodReturn {
  [key: number | string]: number;
}
