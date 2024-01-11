export interface CreateAsset {
  assetClass: AssetClasses;
  category: AssetCategories;
  sector: string;
  ticker: string;
}
export interface Asset {
  id: number;
  assetHistoricalPrices?: AssetHistoricalPrice[];
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
export interface GetAssetsFilters {
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

export async function createAsset(createAsset: CreateAsset): Promise<Asset> {
  const response = await fetch(
    'http://localhost:3000/assets',
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(createAsset)
    }
  );
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as Asset;
}

export async function getAssets(filters?: GetAssetsFilters): Promise<Asset[]> {
  const url = new URL('http://localhost:3000/assets');
  const urlSearchParams = new URLSearchParams();

  if (filters?.active !== undefined) {
    urlSearchParams.append('active', String(filters.active));
  }

  url.search = urlSearchParams.toString();

  const response = await fetch(url);
  const data: Asset[] = await response.json();

  return data;
}
