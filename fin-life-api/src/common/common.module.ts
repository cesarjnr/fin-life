import { Module } from '@nestjs/common';

import { DateHelper } from './helpers/date.helper';
import { CurrencyHelper } from './helpers/currency.helper';

@Module({
  exports: [DateHelper, CurrencyHelper],
  providers: [DateHelper, CurrencyHelper]
})
export class CommonModule {}
