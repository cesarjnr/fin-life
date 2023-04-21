import { IsNumber } from 'class-validator';

export class CreateWalletDto {
  @IsNumber()
  numberOfQuotas: number;
}