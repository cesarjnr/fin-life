import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateMarketIndexDto,
  GetMarketIndexesDto,
  MarketIndex,
  syncMarketIndexValuesDto,
} from '../dtos/market-index.dto';
import { GetRequestResponse } from '../dtos/request';

@Injectable({ providedIn: 'root' })
export class MarketIndexesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/market-indexes`;

  public create(
    createMarketIndexDto: CreateMarketIndexDto,
  ): Observable<MarketIndex> {
    return this.http.post<MarketIndex>(`${this.apiUrl}`, createMarketIndexDto, {
      withCredentials: true,
    });
  }

  public syncValues(
    syncMarketIndexValuesDto?: syncMarketIndexValuesDto,
  ): Observable<MarketIndex[]> {
    return this.http.post<MarketIndex[]>(
      `${this.apiUrl}/market-index-historical-data/sync`,
      syncMarketIndexValuesDto,
      { withCredentials: true },
    );
  }

  public get(
    getMarketIndexesDto?: GetMarketIndexesDto,
  ): Observable<GetRequestResponse<MarketIndex>> {
    let params = new HttpParams();

    if (
      getMarketIndexesDto?.active !== undefined &&
      getMarketIndexesDto?.active !== null
    ) {
      params = params.append('active', getMarketIndexesDto.active);
    }

    if (getMarketIndexesDto?.codes?.length) {
      getMarketIndexesDto.codes.forEach((code) => {
        params = params.append('codes[]', code);
      });
    }

    if (
      getMarketIndexesDto?.limit !== undefined &&
      getMarketIndexesDto?.page !== undefined
    ) {
      params = params
        .append('limit', getMarketIndexesDto.limit)
        .append('page', getMarketIndexesDto.page);
    }

    return this.http.get<GetRequestResponse<MarketIndex>>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  public find(id: number): Observable<MarketIndex> {
    return this.http.get<MarketIndex>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
