import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PortfolioAssetDividend } from '../dtos/portfolio-asset-dividend.dto';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';

export type GetPortfolioAssetsDividendsDto = PaginationParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsDividendsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  public get(
    userId: number,
    portfolioId: number,
    queryParams?: GetPortfolioAssetsDividendsDto,
  ): Observable<PaginationResponse<PortfolioAssetDividend>> {
    const { portfolioAssetId, from, to, page, limit } = queryParams ?? {};
    let params = new HttpParams();

    if (portfolioAssetId) {
      params = params.append('portfolioAssetId', portfolioAssetId);
    }

    if (from) {
      params = params.append('from', from);
    }

    if (to) {
      params = params.append('to', to);
    }

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<PaginationResponse<PortfolioAssetDividend>>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/portfolios-assets-dividends`,
      { params, withCredentials: true },
    );
  }
}
