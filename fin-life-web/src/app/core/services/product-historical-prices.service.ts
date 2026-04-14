import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { environment } from '../../environments/environment';
import { Observable } from "rxjs";
import { AssetHistoricalPrice } from "../dtos/asset-historical-price.dto";
import { GetRequestResponse } from "../dtos/request";

@Injectable({
  providedIn: 'root',
})
export class ProductHistoricalPricesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public get(assetId: number): Observable<GetRequestResponse<AssetHistoricalPrice>> {
    return this.http.get<GetRequestResponse<AssetHistoricalPrice>>(`${this.apiUrl}/${assetId}/asset-historical-prices`, { withCredentials: true });
  }
}