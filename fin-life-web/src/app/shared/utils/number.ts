import { Currencies } from '../../core/dtos/common.dto';

const currencyLocalesMap = new Map<Currencies, Intl.LocalesArgument>([
  [Currencies.USD, 'en-US'],
  [Currencies.BRL, 'pt-BR'],
]);

export const formatCurrency = (currency: Currencies, value: number): string => {
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

export const roundUpToBaseTen = (value: number): number => {
  // Get the ones digit (second digit from right)
  const onesDigit = Math.floor(value) % 10;

  // Round up to nearest 10
  const baseRounded = Math.ceil(value / 10) * 10;

  // If ones digit is > 5, go to the next base 10
  if (onesDigit > 5) {
    return Math.min(baseRounded + 10, 100);
  } else {
    return Math.min(baseRounded, 100);
  }
};
