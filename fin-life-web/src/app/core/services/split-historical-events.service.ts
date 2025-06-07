import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PaginationParams, PaginationResponse } from '../dtos/pagination.dto';
import { SplitHistoricalEvent } from '../dtos/split-historical-event.dto';

@Injectable({
  providedIn: 'root',
})
export class SplitHistoricalEventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public get(
    assetId: number,
    queryParams?: PaginationParams,
  ): Observable<PaginationResponse<SplitHistoricalEvent>> {
    let params = new HttpParams({ fromObject: { relations: ['asset'] } });

    if (queryParams) {
      params = params
        .append('limit', queryParams.limit)
        .append('page', queryParams.page);
    }

    return this.http.get<PaginationResponse<SplitHistoricalEvent>>(
      `${this.apiUrl}/${assetId}/split-historical-events`,
      { params },
    );
  }
}
