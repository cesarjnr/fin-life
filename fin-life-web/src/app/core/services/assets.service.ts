import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Asset, CreateAssetDto } from '../dtos/asset.dto';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public create(createAssetDto: CreateAssetDto): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}`, createAssetDto);
  }

  public get(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  public find(id: number): Observable<Asset> {
    const params = new HttpParams({ fromObject: { withLastPrice: true } });

    return this.http.get<Asset>(`${this.apiUrl}/${id}`, { params });
  }

  public syncPrices(id: number): Observable<Asset> {
    return this.http.patch<Asset>(`${this.apiUrl}/${id}/sync-prices`, null);
  }
}
