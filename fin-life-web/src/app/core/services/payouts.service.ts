import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreatePayoutDto,
  Payout,
  GetPayoutsDto,
  PayoutsOverview,
  UpdatePayoutDto,
} from '../dtos/payout.dto';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class PayoutsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public create(
    portfolioId: number,
    portfolioAssetId: number,
    createPayoutdDto: CreatePayoutDto,
  ): Observable<Payout> {
    return this.http.post<Payout>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/payouts`,
      createPayoutdDto,
      { withCredentials: true },
    );
  }

  public import(
    portfolioId: number,
    portfolioAssetId: number,
    file: File,
  ): Observable<Payout[]> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Payout[]>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/payouts/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    getPayoutsDto?: GetPayoutsDto,
  ): Observable<GetRequestResponse<Payout>> {
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

    return this.http.get<GetRequestResponse<Payout>>(
      `${this.apiUrl}/${portfolioId}/payouts`,
      { params, withCredentials: true },
    );
  }

  public getOverview(portfolioId: number): Observable<PayoutsOverview> {
    return this.http.get<PayoutsOverview>(
      `${this.apiUrl}/${portfolioId}/payouts/overview`,
      { withCredentials: true },
    );
  }

  public update(
    portfolioId: number,
    portfolioAssetId: number,
    portfolioAssetDividendId: number,
    updatePayoutDto: UpdatePayoutDto,
  ): Observable<Payout> {
    return this.http.patch<Payout>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/payouts/${portfolioAssetDividendId}`,
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
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/payouts/${payoutId}`,
      { withCredentials: true },
    );
  }
}
