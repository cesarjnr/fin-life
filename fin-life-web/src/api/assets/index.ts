import { AssetHistoricalPrice } from '../asset-historical-prices';
import { DividendHistoricalPayment } from '../dividend-historical-payments';
import { SplitHistoricalEvent } from '../split-historical-events';

export interface CreateAsset {
  assetClass: AssetClasses;
  category: AssetCategories;
  sector: string;
  ticker: string;
}
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

export async function getAssets(params?: GetAssetsParams): Promise<Asset[]> {
  const url = new URL('http://localhost:3000/assets');
  const urlSearchParams = new URLSearchParams();

  if (params?.active !== undefined) {
    urlSearchParams.append('active', String(params.active));
  }

  url.search = urlSearchParams.toString();

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const response = await fetch(url);
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as Asset[];
}

export async function findAsset(id: number): Promise<Asset> {
  const response = await fetch(`http://localhost:3000/assets/${id}`);

  // await new Promise((resolve) => setTimeout(resolve, 6000));

  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as Asset;
}
