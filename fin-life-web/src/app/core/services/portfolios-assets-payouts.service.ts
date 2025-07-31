import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreatePortfolioAssetPayoutDto,
  PortfolioAssetPayout,
  GetPortfolioAssetsPayoutsDto,
  PortfolioAssetsPayoutsOverview,
  UpdatePortfolioAssetPayoutDto,
} from '../dtos/portfolio-asset-payout.dto';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsPayoutsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public create(
    portfolioId: number,
    portfolioAssetId: number,
    createPayoutdDto: CreatePortfolioAssetPayoutDto,
  ): Observable<PortfolioAssetPayout> {
    return this.http.post<PortfolioAssetPayout>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-payouts`,
      createPayoutdDto,
      { withCredentials: true },
    );
  }

  public import(
    portfolioId: number,
    portfolioAssetId: number,
    file: File,
  ): Observable<PortfolioAssetPayout[]> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<PortfolioAssetPayout[]>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-payouts/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    getPayoutsDto?: GetPortfolioAssetsPayoutsDto,
  ): Observable<GetRequestResponse<PortfolioAssetPayout>> {
    const { portfolioAssetId, from, to, page, limit } = getPayoutsDto ?? {};
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

    return this.http.get<GetRequestResponse<PortfolioAssetPayout>>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets-payouts`,
      { params, withCredentials: true },
    );
  }

  public getOverview(
    portfolioId: number,
  ): Observable<PortfolioAssetsPayoutsOverview> {
    return this.http.get<PortfolioAssetsPayoutsOverview>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets-payouts/overview`,
      { withCredentials: true },
    );
  }

  public update(
    portfolioId: number,
    portfolioAssetId: number,
    portfolioAssetDividendId: number,
    updatePayoutDto: UpdatePortfolioAssetPayoutDto,
  ): Observable<PortfolioAssetPayout> {
    return this.http.patch<PortfolioAssetPayout>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-payouts/${portfolioAssetDividendId}`,
      updatePayoutDto,
      { withCredentials: true },
    );
  }

  public delete(
    portfolioId: number,
    portfolioAssetId: number,
    payoutId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/portfolios-assets-payouts/${payoutId}`,
      { withCredentials: true },
    );
  }
}
