'use server'

import { revalidateTag } from "next/cache";

import { Asset, GetAssetsParams, PutAsset, UpdateAsset } from "./asset.types";

export async function createAsset(payload: PutAsset): Promise<Asset> {
  const response = await fetch(
    'http://localhost:3000/assets',
    {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    }
  );
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  revalidateTag('assets');

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

  const response = await fetch(url, { next: { tags: ['assets'] } });
  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as Asset[];
}

export async function findAsset(id: number): Promise<Asset> {
  const response = await fetch(`http://localhost:3000/assets/${id}`, { next: { tags: ['assets'] } });

  // await new Promise((resolve) => setTimeout(resolve, 6000));

  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  return body as Asset;
}

export async function updateAsset(id: number, payload: UpdateAsset): Promise<Asset> {
  const response = await fetch(
    `http://localhost:3000/assets/${id}`,
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
      body: JSON.stringify(payload)
    }
  );

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const body = await response.json();

  if (body.message) {
    throw new Error(body.message);
  }

  revalidateTag('assets');

  return body as Asset;
}
