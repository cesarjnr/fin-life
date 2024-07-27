import { format } from "date-fns";

export function formatDate(date: Date | number, pattern: string = 'dd/MM/yyyy'): string {
  const utcDateStringAsLocalString = new Date(new Date(date).toISOString().slice(0, -1));

  return format(utcDateStringAsLocalString, pattern);
}
