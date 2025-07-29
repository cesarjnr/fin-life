import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DividendsChartData, GetChartDataDto } from '../dtos/chart.dto';

@Injectable({
  providedIn: 'root',
})
export class ChartsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public getDividendsChartData(
    getChartDataDto: GetChartDataDto,
  ): Observable<DividendsChartData[]> {
    const { portfolioId, assetId, start, end, groupByPeriod } = getChartDataDto;
    let params = new HttpParams();

    if (assetId) {
      params = params.append('assetId', assetId);
    }

    if (start) {
      params = params.append('start', start);
    }

    if (end) {
      params = params.append('end', end);
    }

    if (groupByPeriod) {
      params = params.append('groupByPeriod', groupByPeriod);
    }

    return this.http.get<DividendsChartData[]>(
      `${this.apiUrl}/${portfolioId}/charts/dividends`,
      { params, withCredentials: true },
    );
  }
}
