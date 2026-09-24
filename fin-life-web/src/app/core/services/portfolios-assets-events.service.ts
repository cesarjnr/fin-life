import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreatePortfolioAssetEventDto,
  PortfolioAssetEvent,
  GetPortfolioAssetEventsDto,
  PortfolioAssetsPayoutsOverview,
} from '../dtos/portfolio-asset-event.dto';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsEventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public create(
    portfolioId: number,
    portfolioAssetId: number,
    createPortfolioAssetEventDto: CreatePortfolioAssetEventDto,
  ): Observable<PortfolioAssetEvent> {
    return this.http.post<PortfolioAssetEvent>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/events`,
      createPortfolioAssetEventDto,
      { withCredentials: true },
    );
  }

  public import(
    portfolioId: number,
    portfolioAssetId: number,
    file: File,
  ): Observable<PortfolioAssetEvent[]> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<PortfolioAssetEvent[]>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/events/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    getPayoutsDto?: GetPortfolioAssetEventsDto,
  ): Observable<GetRequestResponse<PortfolioAssetEvent>> {
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

    return this.http.get<GetRequestResponse<PortfolioAssetEvent>>(
      `${this.apiUrl}/${portfolioId}/events`,
      { params, withCredentials: true },
    );
  }

  public getPayoutsOverview(
    portfolioId: number,
  ): Observable<PortfolioAssetsPayoutsOverview> {
    return this.http.get<PortfolioAssetsPayoutsOverview>(
      `${this.apiUrl}/${portfolioId}/events/payouts-overview`,
      { withCredentials: true },
    );
  }

  // public update(
  //   portfolioId: number,
  //   portfolioAssetId: number,
  //   portfolioAssetDividendId: number,
  //   updatePayoutDto: UpdatePayoutDto,
  // ): Observable<Payout> {
  //   return this.http.patch<Payout>(
  //     `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/payouts/${portfolioAssetDividendId}`,
  //     updatePayoutDto,
  //     { withCredentials: true },
  //   );
  // }

  // public delete(
  //   portfolioId: number,
  //   portfolioAssetId: number,
  //   payoutId: number,
  // ): Observable<void> {
  //   return this.http.delete<void>(
  //     `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/payouts/${payoutId}`,
  //     { withCredentials: true },
  //   );
  // }
}
