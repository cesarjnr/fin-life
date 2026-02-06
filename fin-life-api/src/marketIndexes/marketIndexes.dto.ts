import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

import { DateIntervals } from '../common/enums/date';
import { MarketIndexTypes } from './marketIndex.entity';
import { GetRequestParams } from '../common/dto/request';

export class CreateMarketIndexDto {
  @IsString()
  code: string;

  @IsEnum(DateIntervals)
  interval: DateIntervals;

  @IsEnum(MarketIndexTypes)
  type: MarketIndexTypes;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
export class SyncMarketIndexDataDto {
  @IsOptional()
  @IsInt()
  marketIndexId?: number;
}
export class FindMarketIndexDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FindMarketIndexRelationsDto)
  relations?: FindMarketIndexRelationsDto[];
}
export class FindMarketIndexRelationsDto {
  @IsString()
  @IsIn(['marketIndexHistoricalData'])
  name: 'marketIndexHistoricalData';

  @IsString()
  alias: string;
}

export type GetMarketIndexesDto = GetRequestParams & {
  codes?: string[];
  active?: boolean;
};
