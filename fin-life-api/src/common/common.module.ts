import { Module } from '@nestjs/common';

import { DateHelper } from './helpers/date.helper';

@Module({
  exports: [DateHelper],
  providers: [DateHelper]
})
export class CommonModule {}
