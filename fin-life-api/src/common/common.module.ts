import { Module } from '@nestjs/common';

import { DateHelper } from './helpers/date.helper';
import { CurrencyHelper } from './helpers/currency.helper';
import { PasswordHelper } from './helpers/password.helper';

@Module({
  exports: [DateHelper, CurrencyHelper, PasswordHelper],
  providers: [DateHelper, CurrencyHelper, PasswordHelper]
})
export class CommonModule {}
