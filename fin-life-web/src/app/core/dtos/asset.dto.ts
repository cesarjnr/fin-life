import { AssetHistoricalPrice } from './asset-historical-price.dto';

export interface CreateAssetDto {
  ticker: string;
  category: AssetCategories;
  assetClass: AssetClasses;
  sector: string;
  currency: AssetCurrencies;
}
export interface Asset {
  id: number;
  ticker: string;
  category: AssetCategories;
  class: AssetClasses;
  sector: string;
  active: boolean;
  allTimeHighPrice: number;
  currency: AssetCurrencies;
  assetHistoricalPrices: AssetHistoricalPrice[];
}

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncome = 'Renda Fixa',
}
export enum AssetClasses {
  Stock = 'Ação',
  International = 'Internacional',
  RealState = 'Imobiliário',
  Cash = 'Caixa',
  Cryptocurrency = 'Criptomoeda',
}
export enum AssetCurrencies {
  BRL = 'BRL',
  USD = 'USD',
}
