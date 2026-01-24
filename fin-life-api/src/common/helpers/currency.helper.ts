import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyHelper {
  public parse(value: string): number {
    return Number(value.replace(/[^\d,]/g, '').replace(',', '.'));
  }
}
