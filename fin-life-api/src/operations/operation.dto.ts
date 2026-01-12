import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { OperationTypes } from './operation.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateOperationDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly assetId: number;

  @IsNumber()
  readonly price: number;

  @IsEnum(OperationTypes)
  readonly type: OperationTypes;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in yyyy-MM-dd format' })
  readonly date: string;

  @IsString()
  readonly institution: string;

  @IsNumber()
  @IsOptional()
  readonly fees?: number;

  @IsNumber()
  @IsOptional()
  readonly taxes?: number;
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
