import { AssetHistoricalPrice } from './asset-historical-price.dto';
import { Currencies } from './common.dto';

export type UpdateAssetDto = Partial<CreateAssetDto> & { active?: boolean };

export interface CreateAssetDto {
  code: string;
  category: AssetCategories;
  assetClass: AssetClasses;
  sector?: string;
  currency: Currencies;
}
export interface SyncPricesDto {
  assetId?: number;
}
export interface Asset {
  id: number;
  active: boolean;
  allTimeHighPrice: number;
  assetHistoricalPrices: AssetHistoricalPrice[];
  category: AssetCategories;
  class: AssetClasses;
  code: string;
  currency: Currencies;
  index?: string;
  name: string;
  rate?: number;
  startDate?: string;
  sector?: string;
}

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncome = 'Renda Fixa',
}
export enum AssetClasses {
  Stock = 'Ação',
  International = 'Internacional',
  RealState = 'Fundo Imobiliário',
  Cash = 'Caixa',
  Cryptocurrency = 'Criptomoeda',
}
