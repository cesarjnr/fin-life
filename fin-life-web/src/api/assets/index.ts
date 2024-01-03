export interface Asset {
  id: number;
  assetHistoricalPrices: AssetHistoricalPrice[];
  category: AssetCategories;
  class: AssetClasses;
  sector: string;
  ticker: string;
}

export interface AssetHistoricalPrice {
  id: number;
  assetId: number;
  closingPrice: number;
  date: string;
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

export async function getAssets(): Promise<Asset[]> {
  const response = await fetch('http://localhost:3000/assets');
  const data: Asset[] = await response.json();

  return data;
}
