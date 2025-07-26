import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreatePortfolioAssetDividendDto,
  PortfolioAssetDividend,
  PortfolioAssetsDividendsOverview,
  UpdatePortfolioAssetDividendDto,
} from '../dtos/portfolio-asset-dividend.dto';
import { GetRequestParams, GetRequestResponse } from '../dtos/request';

export type GetPortfolioAssetsDividendsDto = GetRequestParams & {
  portfolioAssetId?: number;
  from?: string;
  to?: string;
};

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsDividendsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public create(
    portfolioId: number,
    portfolioAssetId: number,
    createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto,
  ): Observable<PortfolioAssetDividend> {
    return this.http.post<PortfolioAssetDividend>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends`,
      createPortfolioAssetDividendDto,
      { withCredentials: true },
    );
  }

  public import(
    portfolioId: number,
    portfolioAssetId: number,
    file: File,
  ): Observable<PortfolioAssetDividend[]> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<PortfolioAssetDividend[]>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    queryParams?: GetPortfolioAssetsDividendsDto,
  ): Observable<GetRequestResponse<PortfolioAssetDividend>> {
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

    return this.http.get<GetRequestResponse<PortfolioAssetDividend>>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets-dividends`,
      { params, withCredentials: true },
    );
  }

  public getOverview(
    portfolioId: number,
  ): Observable<PortfolioAssetsDividendsOverview> {
    return this.http.get<PortfolioAssetsDividendsOverview>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets-dividends/overview`,
      { withCredentials: true },
    );
  }

  public update(
    portfolioId: number,
    portfolioAssetId: number,
    portfolioAssetDividendId: number,
    updatePortfolioAssetDividendDto: UpdatePortfolioAssetDividendDto,
  ): Observable<PortfolioAssetDividend> {
    return this.http.patch<PortfolioAssetDividend>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends/${portfolioAssetDividendId}`,
      updatePortfolioAssetDividendDto,
      { withCredentials: true },
    );
  }

  public delete(
    portfolioId: number,
    portfolioAssetId: number,
    portfolioAssetDividendId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-dividends/${portfolioAssetDividendId}`,
      { withCredentials: true },
    );
  }
}
