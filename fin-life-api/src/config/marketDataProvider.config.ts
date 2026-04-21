import { registerAs } from '@nestjs/config';

export const assetPricesProviderConfig = registerAs('assetPricesProvider', () => ({
  // basePath: process.env.ALPHA_ADVANTAGE_API_BASE_PATH,
  // apiKey: process.env.ALPHA_ADVANTAGE_API_KEY,
  yahooFinanceApiBasePath: process.env.YAHOO_FINANCE_API_BASE_PATH,
  brazilianCentralBankRatesApiBasePath: process.env.BRAZILIAN_CENTRAL_BANK_RATES_API_BASE_PATH,
  brazilianCentralBankCurrenciesApiBasePath: process.env.BRAZILIAN_CENTRAL_BANK_CURRENCIES_API_BASE_PATH
}));
