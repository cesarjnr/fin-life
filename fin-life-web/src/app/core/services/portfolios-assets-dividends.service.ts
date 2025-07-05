import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PortfolioAssetDividend } from '../dtos/portfolio-asset-dividend.dto';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsDividendsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  public get(
    userId: number,
    portfolioId: number,
    portfolioAssetId: number,
    queryParams?: PaginationParams,
  ): Observable<PaginationResponse<PortfolioAssetDividend>> {
    let params = new HttpParams();

    if (queryParams) {
      params = params
        .append('limit', queryParams.limit)
        .append('page', queryParams.page);
    }

    return this.http.get<PaginationResponse<PortfolioAssetDividend>>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends`,
      { params, withCredentials: true },
    );
  }
}
