import { IsEnum, IsNumber, Matches } from 'class-validator';

import { BuySellType } from './buySell.entity';

export class CreateBuySellDto {
  @IsNumber()
  readonly amount: number;

  @IsNumber()
  readonly assetId: number;

  @IsNumber()
  readonly price: number;

  @IsEnum(BuySellType)
  readonly type: BuySellType;

  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in MM-dd-yyyy format' })
  readonly date: string;
}