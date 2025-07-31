import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PayoutsChartData, GetChartDataDto } from '../dtos/chart.dto';

@Injectable({
  providedIn: 'root',
})
export class ChartsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public getPayoutsChartData(
    getChartDataDto: GetChartDataDto,
  ): Observable<PayoutsChartData[]> {
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

    return this.http.get<PayoutsChartData[]>(
      `${this.apiUrl}/${portfolioId}/charts/payouts`,
      { params, withCredentials: true },
    );
  }
}
