import { SortDirection } from '@angular/material/sort';

export interface GetRequestParams {
  limit?: number;
  page?: number;
  orderBy?: SortDirection;
  orderByColumn?: string;
}
export interface GetRequestResponse<T> {
  data: T[];
  itemsPerPage: number | null;
  page: number | null;
  total: number;
}
