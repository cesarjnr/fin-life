import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Asset, CreateAssetDto, UpdateAssetDto } from '../dtos/asset.dto';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public create(createAssetDto: CreateAssetDto): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}`, createAssetDto, {
      withCredentials: true,
    });
  }

  public get(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl, { withCredentials: true });
  }

  public find(id: number): Observable<Asset> {
    const params = new HttpParams({ fromObject: { withLastPrice: true } });

    return this.http.get<Asset>(`${this.apiUrl}/${id}`, {
      params,
      withCredentials: true,
    });
  }

  public update(id: number, updateAssetDto: UpdateAssetDto): Observable<Asset> {
    return this.http.patch<Asset>(`${this.apiUrl}/${id}`, updateAssetDto, {
      withCredentials: true,
    });
  }

  public syncPrices(id: number): Observable<Asset> {
    return this.http.patch<Asset>(`${this.apiUrl}/${id}/sync-prices`, null, {
      withCredentials: true,
    });
  }
}
