import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { GetRequestParams, GetRequestResponse } from '../dtos/request';
import { SplitHistoricalEvent } from '../dtos/split-historical-event.dto';

@Injectable({
  providedIn: 'root',
})
export class SplitHistoricalEventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public get(
    assetId: number,
    queryParams?: GetRequestParams,
  ): Observable<GetRequestResponse<SplitHistoricalEvent>> {
    const { page, limit } = queryParams ?? {};
    let params = new HttpParams({ fromObject: { relations: ['asset'] } });

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<SplitHistoricalEvent>>(
      `${this.apiUrl}/${assetId}/split-historical-events`,
      { params, withCredentials: true },
    );
  }
}
