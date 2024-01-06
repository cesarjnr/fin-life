import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { MaterialThemeProvider } from '@/providers/material-theme';
import { DatePickerProvider } from '@/providers/date-picker';
import { ModalProvider } from '@/providers/modal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export const metadata: Metadata = {
  title: 'FinLife',
  // description: 'Generated by create next app',
}
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} relative`}>
        <MaterialThemeProvider>
          <DatePickerProvider>
            <ModalProvider>
              {children}

              <ToastContainer
                draggable={false}
                pauseOnHover={false}
                position="bottom-center"
                theme="dark"
              />
            </ModalProvider>
          </DatePickerProvider>
        </MaterialThemeProvider>
      </body>
    </html>
  )
}
