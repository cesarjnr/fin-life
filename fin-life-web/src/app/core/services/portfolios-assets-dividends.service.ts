import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreatePortfolioAssetDividendDto,
  PortfolioAssetDividend,
  UpdatePortfolioAssetDividendDto,
} from '../dtos/portfolio-asset-dividend.dto';
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

  public create(
    userId: number,
    portfolioId: number,
    portfolioAssetId: number,
    createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto,
  ): Observable<PortfolioAssetDividend> {
    return this.http.post<PortfolioAssetDividend>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends`,
      createPortfolioAssetDividendDto,
      { withCredentials: true },
    );
  }

  public import(
    userId: number,
    portfolioId: number,
    portfolioAssetId: number,
    file: File,
  ): Observable<PortfolioAssetDividend[]> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<PortfolioAssetDividend[]>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends/import`,
      formData,
      { withCredentials: true },
    );
  }

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

  public update(
    userId: number,
    portfolioId: number,
    portfolioAssetId: number,
    portfolioAssetDividendId: number,
    updatePortfolioAssetDividendDto: UpdatePortfolioAssetDividendDto,
  ): Observable<PortfolioAssetDividend> {
    return this.http.patch<PortfolioAssetDividend>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends/${portfolioAssetDividendId}`,
      updatePortfolioAssetDividendDto,
      { withCredentials: true },
    );
  }

  public delete(
    userId: number,
    portfolioId: number,
    portfolioAssetId: number,
    portfolioAssetDividendId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends/${portfolioAssetDividendId}`,
      { withCredentials: true },
    );
  }
}
