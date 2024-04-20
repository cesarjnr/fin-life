import { AssetHistoricalPrice } from '../../../api/asset-historical-prices';
import { DividendHistoricalPayment } from '../../../api/dividend-historical-payments';
import { SplitHistoricalEvent } from '../../../api/split-historical-events';

export interface PutAsset {
  assetClass: AssetClasses;
  category: AssetCategories;
  sector: string;
  ticker: string;
}
export type UpdateAsset = Partial<PutAsset> & { active?: boolean };
export interface Asset {
  id: number;
  active: boolean;
  assetHistoricalPrices?: AssetHistoricalPrice[];
  category: AssetCategories;
  class: AssetClasses;
  dividendHistoricalPayments?: DividendHistoricalPayment[];
  sector: string;
  splitHistoricalEvents?: SplitHistoricalEvent[];
  ticker: string;
}
export interface GetAssetsParams {
  active?: boolean;
}

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncoe = 'Renda Fixa'
}
export enum AssetClasses {
  Stock = 'Ações',
  International = 'Internacionais',
  RealState = 'Imobiliários',
  Cash = 'Caixa',
  Cryptocurrency = 'Criptomoedas'
}