import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Asset,
  CreateAssetDto,
  SyncPricesDto,
  UpdateAssetDto,
} from '../dtos/asset.dto';
import { GetRequestParams, GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public create(createAssetDto: CreateAssetDto): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}`, createAssetDto, {
      withCredentials: true,
    });
  }

  public get(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<Asset>> {
    let params = new HttpParams();

    if (
      paginationParams?.limit !== undefined &&
      paginationParams?.page !== undefined
    ) {
      params = params
        .append('limit', paginationParams.limit)
        .append('page', paginationParams.page);
    }

    return this.http.get<GetRequestResponse<Asset>>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  public find(id: number): Observable<Asset> {
    const params = new HttpParams({ fromObject: { withLastPrice: true } });

    return this.http.get<Asset>(`${this.apiUrl}/${id}`, {
      params,
      withCredentials: true,
    });
  }

  public update(id: number, updateAssetDto: UpdateAssetDto): Observable<Asset> {
    return this.http.patch<Asset>(`${this.apiUrl}/${id}`, updateAssetDto, {
      withCredentials: true,
    });
  }

  public syncPrices(syncPricesDto?: SyncPricesDto): Observable<Asset> {
    return this.http.patch<Asset>(
      `${this.apiUrl}/asset-historical-prices/sync-prices`,
      syncPricesDto,
      {
        withCredentials: true,
      },
    );
  }
}
