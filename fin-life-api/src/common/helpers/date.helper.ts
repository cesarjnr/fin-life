import { Injectable } from '@nestjs/common';

import { addDays, compareAsc, format, subDays } from 'date-fns';

@Injectable()
export class DateHelper {
  public format(date: Date, pattern: string): string {
    return format(date, pattern);
  }

  public subtractDays(date: Date, days: number): Date {
    return subDays(date, days);
  }

  public incrementDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  public isBefore(firstDate: Date, secondDate: Date): boolean {
    return compareAsc(firstDate, secondDate) === -1 ? true : false;
  }
}
