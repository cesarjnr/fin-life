'use client'

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import pt from 'date-fns/locale/pt-BR';

export const DatePickerProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pt}>
      {children}
    </LocalizationProvider>
  )
};
