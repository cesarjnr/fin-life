import { Injectable } from '@nestjs/common';

import { format, subDays } from 'date-fns';

@Injectable()
export class DateHelper {
  public format(date: Date, pattern: string): string {
    return format(date, pattern);
  }

  public subtractDays(date: Date, days: number): Date {
    return subDays(date, days);
  }
}
