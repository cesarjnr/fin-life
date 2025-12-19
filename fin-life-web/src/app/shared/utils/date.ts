import { format } from 'date-fns';

export const formatDate = (date: string, pattern = 'dd/MM/yyyy'): string => {
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return format(parsedDate, pattern);
};
