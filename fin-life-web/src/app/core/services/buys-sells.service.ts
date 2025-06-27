import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BuySell, CreateBuySellDto } from '../dtos/buy-sell.dto';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';

export type GetBuysSellsDto = Partial<PaginationParams> & {
  assetId?: string;
};

@Injectable({
  providedIn: 'root',
})
export class BuysSellsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  public create(
    userId: number,
    portfolioId: number,
    createBuySellDto: CreateBuySellDto,
  ): Observable<BuySell> {
    return this.http.post<BuySell>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/buys-sells`,
      createBuySellDto,
    );
  }

  public get(
    userId: number,
    portfolioId: number,
    getBuySellsDto?: GetBuysSellsDto,
  ): Observable<PaginationResponse<BuySell>> {
    const { limit, page, assetId } = getBuySellsDto || {};
    let params = new HttpParams();

    if (limit && page) {
      params = params.append('limit', limit).append('page', page);
    }

    if (assetId) {
      params = params.append('assetId', assetId);
    }

    return this.http.get<PaginationResponse<BuySell>>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/buys-sells`,
      { params },
    );
  }

  public delete(
    userId: number,
    portfolioId: number,
    buySellId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/buys-sells/${buySellId}`,
    );
  }
}
