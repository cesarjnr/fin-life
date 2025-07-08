import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PortfolioOverview } from '../dtos/portfolio.dto';

@Injectable({
  providedIn: 'root',
})
export class PortfoliosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  public getOverview(
    userId: number,
    portfolioId: number,
  ): Observable<PortfolioOverview> {
    return this.http.get<PortfolioOverview>(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}/overview`,
      { withCredentials: true },
    );
  }
}
