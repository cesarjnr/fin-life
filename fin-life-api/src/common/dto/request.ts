import { Request as ExpressRequest } from 'express';

export type Request = ExpressRequest & {
  user: {
    sub: number;
    username: string;
    iat: number;
    exp: number;
  };
};

export interface GetRequestParams {
  limit?: string;
  page?: string;
  orderBy?: OrderBy;
  orderByColumn?: string;
}
export interface GetRequestResponse<T> {
  data: T[];
  itemsPerPage: number | null;
  page: number | null;
  total: number;
}
export interface NormalizedPaginationParams {
  limit: number | null;
  page: number | null;
  orderBy: OrderBy;
  orderByColumn: string;
}

export enum OrderBy {
  Asc = 'ASC',
  Desc = 'DESC'
}
