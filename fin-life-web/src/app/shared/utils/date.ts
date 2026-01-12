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

export const startOfMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`;
};

export const endOfMonth = (date: Date): string => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const day = new Date(year, month, 0).getDate();

  return `${year}-${String(month).padStart(2, '0')}-${day}T23:59:59.999Z`;
};
