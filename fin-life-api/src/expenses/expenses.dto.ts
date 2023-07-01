import { IsString, IsNumber, IsEnum, IsOptional, Matches } from 'class-validator';

import { PaymentMethods } from './expenses.enum';

export class CreateExpenseDto {
  @IsString()
  readonly description: string;

  @IsNumber()
  readonly value: number;

  @IsString()
  @IsOptional()
  readonly counterpart: string;

  @IsEnum(PaymentMethods, { message: "paymentMethod must be 'debit', 'credit', 'pix', 'money' or 'bank_transfer'" })
  @IsOptional()
  readonly paymentMethod: PaymentMethods;

  @IsString()
  @IsOptional()
  readonly paymentInstitution: string;

  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in MM-dd-yyyy format' })
  readonly date: string;

  @IsNumber()
  @IsOptional()
  readonly expenseCategoryId: number;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsNumber()
  @IsOptional()
  readonly value?: number;

  @IsString()
  @IsOptional()
  readonly counterpart: string;

  @IsEnum(PaymentMethods, { message: "paymentMethod must be 'debit', 'credit', 'pix', 'money' or 'bank_transfer'" })
  @IsOptional()
  readonly paymentMethod: PaymentMethods;

  @IsString()
  @IsOptional()
  readonly paymentInstitution: string;

  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in MM-dd-yyyy format' })
  @IsOptional()
  readonly date: string;

  @IsNumber()
  @IsOptional()
  readonly expenseCategoryId: number;
}
