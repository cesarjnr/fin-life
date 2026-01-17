import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PortfolioAsset,
  PortfolioAssetMetrics,
  GetPortfoliosAssetsParamsDto,
  GetPortfoliosAssetsDto,
  PortfolioAssetsOverview,
  UpdatePortfolioAssetDto,
} from '../dtos/portfolio-asset.dto';
import { environment } from '../../environments/environment';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public get(
    getPortfoliosAssetsParamsDto: GetPortfoliosAssetsParamsDto,
  ): Observable<GetRequestResponse<GetPortfoliosAssetsDto>> {
    const { portfolioId, limit, page } = getPortfoliosAssetsParamsDto;
    let params = new HttpParams();

    if (limit !== undefined && page !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<GetPortfoliosAssetsDto>>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets`,
      { params, withCredentials: true },
    );
  }

  public getOverview(portfolioId: number): Observable<PortfolioAssetsOverview> {
    return this.http.get<PortfolioAssetsOverview>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/overview`,
      { withCredentials: true },
    );
  }

  public find(
    portfolioId: number,
    portfolioAssetId: number,
  ): Observable<PortfolioAsset> {
    return this.http.get<PortfolioAsset>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}`,
      { withCredentials: true },
    );
  }

  public getMetrics(
    portfolioId: number,
    portfolioAssetId: number,
  ): Observable<PortfolioAssetMetrics> {
    return this.http.get<PortfolioAssetMetrics>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}/metrics`,
      { withCredentials: true },
    );
  }

  public update(
    portfolioId: number,
    portfolioAssetId: number,
    updatePortfolioAssetDto: UpdatePortfolioAssetDto,
  ): Observable<PortfolioAsset> {
    return this.http.patch<PortfolioAsset>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}`,
      updatePortfolioAssetDto,
      { withCredentials: true },
    );
  }

  public delete(
    portfolioId: number,
    portfolioAssetId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/${portfolioAssetId}`,
      { withCredentials: true },
    );
  }
}
