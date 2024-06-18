import { format } from "date-fns";

export function formatDate(date: Date | number, pattern: string = 'dd/MM/yyyy'): string {
  return format(date, pattern);
}
