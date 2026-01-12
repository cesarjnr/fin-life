import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from '../dtos/comments.dto';
import { GetRequestParams, GetRequestResponse } from '../dtos/request';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolios-assets`;

  public create(
    portfolioAssetId: number,
    createCommentDto: CreateCommentDto,
  ): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/${portfolioAssetId}/comments`,
      createCommentDto,
      { withCredentials: true },
    );
  }

  public get(
    portfolioAssetId: number,
    getCommentsDto?: GetRequestParams,
  ): Observable<GetRequestResponse<Comment>> {
    const { orderBy, orderByColumn, page, limit } = getCommentsDto || {};
    let params = new HttpParams();

    if (orderBy && orderByColumn) {
      params = params
        .append('orderBy', orderBy.toUpperCase())
        .append('orderByColumn', orderByColumn);
    }

    if (page !== undefined && limit !== undefined) {
      params = params.append('limit', limit).append('page', page);
    }

    return this.http.get<GetRequestResponse<Comment>>(
      `${this.apiUrl}/${portfolioAssetId}/comments`,
      { params, withCredentials: true },
    );
  }

  public update(
    portfolioAssetId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Observable<Comment> {
    return this.http.patch<Comment>(
      `${this.apiUrl}/${portfolioAssetId}/comments/${commentId}`,
      updateCommentDto,
      { withCredentials: true },
    );
  }

  public delete(portfolioAssetId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${portfolioAssetId}/comments/${commentId}`,
      { withCredentials: true },
    );
  }
}
