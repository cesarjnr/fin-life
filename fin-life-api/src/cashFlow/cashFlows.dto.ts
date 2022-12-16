import { IsString, IsNumber, IsEnum, IsOptional, Matches } from 'class-validator';

import { CashFlowType, PaymentMethod } from './cashFlows.enum';

export class CreateCashFlowDto {
  @IsString()
  readonly description: string;

  @IsNumber()
  readonly value: number;

  @IsEnum(CashFlowType, { message: "type must be 'revenue' or 'expense'" })
  readonly type: CashFlowType;

  @IsOptional()
  @IsString()
  readonly counterpart: string;

  @IsOptional()
  @IsEnum(PaymentMethod, { message: "paymentMethod must be 'debit', 'credit', 'pix', 'money' or 'bank_transfer'" })
  readonly paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  readonly paymentInstitution: string;

  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in dd-MM-yyyy format' })
  readonly date: string;

  @IsNumber()
  readonly expenseCategoryId: number;
}
