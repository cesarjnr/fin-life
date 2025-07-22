import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  BuySell,
  CreateBuySellDto,
  ImportBuysSellsDto,
} from '../dtos/buy-sell.dto';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';

export type GetBuysSellsDto = Partial<PaginationParams> & {
  assetId?: number;
};

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

    formData.append('assetId', String(importBuysSellsDto.assetId));
    formData.append('file', importBuysSellsDto.file);

    return this.http.post<BuySell[]>(
      `${this.apiUrl}/portfolios/${portfolioId}/buys-sells/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    getBuySellsDto?: GetBuysSellsDto,
  ): Observable<PaginationResponse<BuySell>> {
    const { limit, page, assetId } = getBuySellsDto || {};
    let params = new HttpParams();

    if (assetId) {
      params = params.append('assetId', assetId);
    }

    if (limit !== undefined && page !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<PaginationResponse<BuySell>>(
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
