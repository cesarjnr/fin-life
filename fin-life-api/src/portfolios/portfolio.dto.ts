import { IsString } from 'class-validator';

export class PutPorfolioDto {
  @IsString()
  readonly description: string;
}

export interface PortfolioProfitability {
  total: number;
  annual: PeriodReturn;
  monthly: PeriodReturn;
}

export interface PeriodReturn {
  [key: string]: number;
}
