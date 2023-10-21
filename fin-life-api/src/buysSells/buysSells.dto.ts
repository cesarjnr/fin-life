import { IsEnum, IsNumber, Matches } from 'class-validator';

import { BuySellTypes } from './buySell.entity';

export class CreateBuySellDto {
  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  readonly assetId: number;

  @IsNumber()
  readonly price: number;

  @IsEnum(BuySellTypes)
  readonly type: BuySellTypes;

  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in MM-dd-yyyy format' })
  readonly date: string;
}
