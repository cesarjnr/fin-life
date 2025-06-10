import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BuySell, CreateBuySellDto } from '../dtos/buy-sell.dto';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';

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
    queryParams?: PaginationParams,
  ): Observable<PaginationResponse<BuySell>> {
    let params = new HttpParams();

    if (queryParams) {
      params = params
        .append('limit', queryParams.limit)
        .append('page', queryParams.page);
    }

    return this.http.get<PaginationResponse<BuySell>>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/buys-sells`,
      { params },
    );
  }
}
