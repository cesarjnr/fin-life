import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PortfolioAsset,
  PortfolioAssetMetrics,
} from '../dtos/portfolio-asset.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosAssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  public get(
    userId: number,
    portfolioId: number,
  ): Observable<PortfolioAsset[]> {
    return this.http.get<PortfolioAsset[]>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/assets`,
      { withCredentials: true },
    );
  }

  public find(
    userId: number,
    portfolioId: number,
    assetId: number,
  ): Observable<PortfolioAsset> {
    return this.http.get<PortfolioAsset>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/assets/${assetId}`,
      { withCredentials: true },
    );
  }

  public getMetrics(
    userId: number,
    portfolioId: number,
    assetId: number,
  ): Observable<PortfolioAssetMetrics> {
    return this.http.get<PortfolioAssetMetrics>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/assets/${assetId}/metrics`,
      { withCredentials: true },
    );
  }
}
