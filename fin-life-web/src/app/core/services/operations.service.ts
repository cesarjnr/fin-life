import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateOperationDto,
  GetOperationsDto,
  ImportOperationsDto,
  Operation,
} from '../dtos/operation';
import { GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios`;

  public create(
    portfolioId: number,
    createOperationDto: CreateOperationDto,
  ): Observable<Operation> {
    return this.http.post<Operation>(
      `${this.apiUrl}/${portfolioId}/operations`,
      createOperationDto,
      { withCredentials: true },
    );
  }

  public import(
    portfolioId: number,
    importOperationsDto: ImportOperationsDto,
  ): Observable<Operation[]> {
    const formData = new FormData();

    formData.append('file', importOperationsDto.file);

    if (importOperationsDto.assetId) {
      formData.append('assetId', String(importOperationsDto.assetId));
    }

    return this.http.post<Operation[]>(
      `${this.apiUrl}/${portfolioId}/operations/import`,
      formData,
      { withCredentials: true },
    );
  }

  public get(
    portfolioId: number,
    getOperationssDto?: GetOperationsDto,
  ): Observable<GetRequestResponse<Operation>> {
    const { portfolioAssetId, assetId, orderBy, orderByColumn, page, limit } =
      getOperationssDto || {};
    let params = new HttpParams();

    if (portfolioAssetId) {
      params = params.append('portfolioAssetId', portfolioAssetId);
    }

    if (assetId) {
      params = params.append('assetId', assetId);
    }

    if (orderBy && orderByColumn) {
      params = params
        .append('orderBy', orderBy.toUpperCase())
        .append('orderByColumn', orderByColumn);
    }

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<Operation>>(
      `${this.apiUrl}/${portfolioId}/operations`,
      { params, withCredentials: true },
    );
  }

  public delete(portfolioId: number, operationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${portfolioId}/operations/${operationId}`,
      { withCredentials: true },
    );
  }
}
