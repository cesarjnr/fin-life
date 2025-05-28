export interface PaginationParams {
  limit: number;
  page: number;
}
export interface PaginationResponse<T> {
  data: T[];
  itemsPerPage: number;
  page: number;
  total: number;
}

export enum OrderBy {
  Asc = 'ASC',
  Desc = 'DESC',
}
