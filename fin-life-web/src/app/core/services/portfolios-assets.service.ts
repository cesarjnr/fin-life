import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PortfolioAsset,
  PortfolioAssetMetrics,
  GetPortfoliosAssetsDto,
} from '../dtos/portfolio-asset.dto';
import { environment } from '../../environments/environment';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  public get(
    getPortfoliosAssetsDto: GetPortfoliosAssetsDto,
  ): Observable<GetRequestResponse<PortfolioAsset>> {
    const { portfolioId, limit, page } = getPortfoliosAssetsDto;
    let params = new HttpParams();

    if (limit !== undefined && page !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<PortfolioAsset>>(
      `${this.apiUrl}/portfolios/${portfolioId}/assets`,
      { params, withCredentials: true },
    );
  }

  public find(
    portfolioId: number,
    assetId: number,
  ): Observable<PortfolioAsset> {
    return this.http.get<PortfolioAsset>(
      `${this.apiUrl}/portfolios/${portfolioId}/assets/${assetId}`,
      { withCredentials: true },
    );
  }

  public getMetrics(
    portfolioId: number,
    assetId: number,
  ): Observable<PortfolioAssetMetrics> {
    return this.http.get<PortfolioAssetMetrics>(
      `${this.apiUrl}/portfolios/${portfolioId}/assets/${assetId}/metrics`,
      { withCredentials: true },
    );
  }
}
