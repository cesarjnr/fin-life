export interface Asset {
  id: number;
  category: AssetCategories;
  class: AssetClasses;
  ticker: string;
  assetHistoricalPrices: AssetHistoricalPrice[];
}

export interface AssetHistoricalPrice {
  id: number;
  assetId: number;
  closingPrice: number;
  date: string;
  splitCoefficient: number | null;
}

export enum AssetCategories {
  VariableIncome = 'variable_income',
  FixedIncoe = 'fixed_income'
}

export enum AssetClasses {
  Stock = 'stock',
  International = 'international',
  RealState = 'real_state',
  Cash = 'cash',
  Cryptocurrency = 'cryptocurrency'
}

