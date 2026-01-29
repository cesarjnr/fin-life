import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Contribution, GetContributionDto } from '../dtos/contributions.dto';

@Injectable({
  providedIn: 'root',
})
export class ContributionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public get(
    portfolioId: number,
    getContributionsDto?: GetContributionDto,
  ): Observable<Contribution[]> {
    const { groupBy, monthContribution, targetPercentages } =
      getContributionsDto || {};
    let params = new HttpParams();

    if (groupBy) {
      params = params.append('groupBy', groupBy);
    }

    if (monthContribution) {
      params = params.append('monthContribution', monthContribution);
    }

    if (targetPercentages) {
      targetPercentages.forEach((targetPercentage, index) => {
        params = params.append(
          `targetPercentages[${index}][label]`,
          targetPercentage.label,
        );
        params = params.append(
          `targetPercentages[${index}][percentage]`,
          targetPercentage.percentage,
        );
      });
    }

    return this.http.get<Contribution[]>(
      `${this.apiUrl}/${portfolioId}/portfolios-assets/contributions`,
      { params, withCredentials: true },
    );
  }
}
