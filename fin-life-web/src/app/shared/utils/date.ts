import { format } from 'date-fns';

export const formatDate = (
  date: Date | string,
  pattern = 'dd/MM/yyyy',
): string => {
  let parsedDate = date;

  if (typeof parsedDate === 'string') {
    parsedDate = parseDate(parsedDate);
  }

  return format(parsedDate, pattern);
};

export const parseDate = (date: string): Date => {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
};
