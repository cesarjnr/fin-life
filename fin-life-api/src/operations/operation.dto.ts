import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { OperationTypes } from './operation.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateOperationDto {
  @IsNumber()
  assetId: number;

  @IsEnum(OperationTypes)
  type: OperationTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  date: string;

  @IsString()
  institution: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  fees?: number;

  @IsOptional()
  @IsNumber()
  taxes?: number;

  @IsOptional()
  @IsNumber()
  total?: number;
}

export class ImportOperationsDto {
  @IsOptional()
  @IsString()
  readonly assetId?: string;
}

export type GetOperationsDto = GetRequestParams & {
  portfolioAssetId?: number | string;
  portfolioId?: number | string;
  assetId?: number | string;
  start?: string;
  end?: string;
  relations?: string[];
};
