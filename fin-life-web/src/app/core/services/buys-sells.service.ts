import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BuySell } from '../dtos/buy-sell.dto';
import { PaginationResponse } from '../dtos/pagination.dto';

@Injectable({
  providedIn: 'root'
})
export class BuysSellsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  public get(userId: number, portfolioId: number): Observable<PaginationResponse<BuySell>> {
    return this.http.get<PaginationResponse<BuySell>>(`${this.apiUrl}/${userId}/portfolios/${portfolioId}/buys-sells`);
  }
}
