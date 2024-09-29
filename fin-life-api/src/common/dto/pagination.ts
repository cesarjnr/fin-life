export interface PaginationParams {
  limit?: string;
  page?: string;
  orderBy?: OrderBy;
  orderByColumn?: string;
}
export interface PaginationResponse<T> {
  data: T[];
  itemsPerPage: number;
  page: number;
  total: number;
}

export enum OrderBy {
  Asc = 'ASC',
  Desc = 'DESC'
}
