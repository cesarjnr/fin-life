import { AssetCurrencies } from '../../core/dtos/asset.dto';

const currencyLocalesMap = new Map<AssetCurrencies, Intl.LocalesArgument>([
  [AssetCurrencies.USD, 'en-US'],
  [AssetCurrencies.BRL, 'pt-BR'],
]);

export const formatCurrency = (
  currency: AssetCurrencies,
  value: number,
): string => {
  const locale = currencyLocalesMap.get(currency);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });

  return formatter.format(value);
};

export const formatPercentage = (value: number): string =>
  `${(value * 100).toFixed(2)}%`;

export const parseMonetaryValue = (value: string): number => {
  const numericValue = value.replace(/[$,]/g, '');

  return Number(numericValue);
};
