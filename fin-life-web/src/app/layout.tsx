import './globals.css';
import 'react-toastify/dist/ReactToastify.min.css';
import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import { Poppins } from 'next/font/google';

import { MaterialThemeProvider } from '@/providers/material-theme';
import { DatePickerProvider } from '@/providers/date-picker';
import { ModalProvider } from '@/providers/modal';
import { getPortfoliosByUserId } from './actions/portfolios';
import { PortfolioProvider } from '@/providers/portfolio';

export const metadata: Metadata = {
  title: 'FinLife',
  // description: 'Generated by create next app',
}
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const portfolios = await getPortfoliosByUserId(1);

  return (
    <html lang="en">
      <body className={`${poppins.className} relative`}>
        <MaterialThemeProvider>
          <DatePickerProvider>
            <PortfolioProvider initialPortfolios={portfolios} initialPortfolio={portfolios[0]}>
              <ModalProvider>
                {children}

                <ToastContainer
                  draggable={false}
                  pauseOnHover={false}
                  position="bottom-center"
                  theme="dark"
                />
              </ModalProvider>
            </PortfolioProvider>
          </DatePickerProvider>
        </MaterialThemeProvider>
      </body>
    </html>
  )
}
