import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';
import { DividendHistoricalPayment } from '../dtos/dividend-historical-payment.dto';

@Injectable({
  providedIn: 'root',
})
export class DividendHistoricalPaymentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public get(
    assetId: number,
    queryParams?: PaginationParams,
  ): Observable<PaginationResponse<DividendHistoricalPayment>> {
    const { page, limit } = queryParams ?? {};
    let params = new HttpParams({ fromObject: { relations: ['asset'] } });

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<PaginationResponse<DividendHistoricalPayment>>(
      `${this.apiUrl}/${assetId}/dividend-historical-payments`,
      { params, withCredentials: true },
    );
  }
}
