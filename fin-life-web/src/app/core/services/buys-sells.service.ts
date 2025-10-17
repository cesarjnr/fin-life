import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  BuySell,
  CreateBuySellDto,
  GetBuysSellsDto,
  ImportBuysSellsDto,
} from '../dtos/buy-sell.dto';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class BuysSellsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  public create(
    portfolioId: number,
    createBuySellDto: CreateBuySellDto,
  ): Observable<BuySell> {
    return this.http.post<BuySell>(
      `${this.apiUrl}/portfolios/${portfolioId}/buys-sells`,
      createBuySellDto,
      { withCredentials: true },
    );
  }

  public import(
    portfolioId: number,
    importBuysSellsDto: ImportBuysSellsDto,
  ): Observable<BuySell[]> {
    const formData = new FormData();

    formData.append('file', importBuysSellsDto.file);

    if (importBuysSellsDto.assetId) {
      formData.append('assetId', String(importBuysSellsDto.assetId));
    }

    return this.http.post<BuySell[]>(
      `${this.apiUrl}/portfolios/${portfolioId}/buys-sells/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    getBuySellsDto?: GetBuysSellsDto,
  ): Observable<GetRequestResponse<BuySell>> {
    const { assetId, orderBy, orderByColumn, page, limit } =
      getBuySellsDto || {};
    let params = new HttpParams();

    if (assetId) {
      params = params.append('assetId', assetId);
    }

    if (orderBy && orderByColumn) {
      params = params
        .append('orderBy', orderBy.toUpperCase())
        .append('orderByColumn', orderByColumn);
    }

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<BuySell>>(
      `${this.apiUrl}/portfolios/${portfolioId}/buys-sells`,
      { params, withCredentials: true },
    );
  }

  public delete(portfolioId: number, buySellId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/portfolios/${portfolioId}/buys-sells/${buySellId}`,
      { withCredentials: true },
    );
  }
}
