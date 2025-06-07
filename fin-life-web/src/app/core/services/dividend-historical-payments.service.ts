import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';
import { Observable } from 'rxjs';
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
    let params = new HttpParams({ fromObject: { relations: ['asset'] } });

    if (queryParams) {
      params = params
        .append('limit', queryParams.limit)
        .append('page', queryParams.page);
    }

    return this.http.get<PaginationResponse<DividendHistoricalPayment>>(
      `${this.apiUrl}/${assetId}/dividend-historical-payments`,
      { params },
    );
  }
}
