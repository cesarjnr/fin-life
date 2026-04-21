import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from '../../environments/environment';
import { AssetHistoricalPrice, GetProductHistoricalPricesDto } from "../dtos/product-historical-price.dto";
import { GetRequestResponse } from "../dtos/request";

@Injectable({
  providedIn: 'root',
})
export class ProductHistoricalPricesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  public get(getProductHistoricalPricesDto: GetProductHistoricalPricesDto): Observable<GetRequestResponse<AssetHistoricalPrice>> {
    const { assetId, orderBy, orderByColumn, page, limit } = getProductHistoricalPricesDto;
    let params = new HttpParams();

    if (orderBy && orderByColumn) {
      params = params
        .append('orderBy', orderBy.toUpperCase())
        .append('orderByColumn', orderByColumn);
    }

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<AssetHistoricalPrice>>(`${this.apiUrl}/${assetId}/asset-historical-prices`, { params, withCredentials: true });
  }
}