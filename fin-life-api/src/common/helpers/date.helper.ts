import { Injectable } from '@nestjs/common';

import { addDays, compareAsc, format, startOfMonth, subDays } from 'date-fns';

@Injectable()
export class DateHelper {
  public format(date: Date, pattern: string): string {
    return format(date, pattern);
  }

  public startOfMonth(date: Date): Date {
    return startOfMonth(date);
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

  public fillDate(date: string): Date {
    const dateParts = date.split('-');
    const parsedYear = Number(dateParts[0]);
    let filledDate = new Date(date);

    if (dateParts.length === 1) {
      filledDate = new Date(parsedYear, 11, 31);
    } else if (dateParts.length === 2) {
      const parsedMonth = Number(dateParts[1]) - 1;

      filledDate = new Date(parsedYear, parsedMonth + 1, 0);
    }

    filledDate.setUTCHours(23, 59, 59, 59);

    return filledDate;
  }
}
