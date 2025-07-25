import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { GetRequestParams, GetRequestResponse } from '../dtos/request';
import { DividendHistoricalPayment } from '../dtos/dividend-historical-payment.dto';

@Injectable({
  providedIn: 'root',
})
export class DividendHistoricalPaymentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public get(
    assetId: number,
    queryParams?: GetRequestParams,
  ): Observable<GetRequestResponse<DividendHistoricalPayment>> {
    const { page, limit } = queryParams ?? {};
    let params = new HttpParams({ fromObject: { relations: ['asset'] } });

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<DividendHistoricalPayment>>(
      `${this.apiUrl}/${assetId}/dividend-historical-payments`,
      { params, withCredentials: true },
    );
  }
}
