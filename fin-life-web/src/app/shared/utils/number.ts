import { AssetCurrencies } from '../../core/dtos/asset.dto';

const currencyLocalesMap = new Map<AssetCurrencies, Intl.LocalesArgument>([
  [AssetCurrencies.USD, 'en-US'],
  [AssetCurrencies.BRL, 'pt-BR'],
]);

export const formatCurrency = (currency: AssetCurrencies, value: number) => {
  const locale = currencyLocalesMap.get(currency);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });

  return formatter.format(value);
};

export const formatPercentage = (value: number) =>
  `${(value * 100).toFixed(2)}%`;
