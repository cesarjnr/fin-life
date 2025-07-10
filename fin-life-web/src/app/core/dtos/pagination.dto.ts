export interface PaginationParams {
  limit: number;
  page: number;
}
export interface PaginationResponse<T> {
  data: T[];
  itemsPerPage: number | null;
  page: number | null;
  total: number;
}

export enum OrderBy {
  Asc = 'ASC',
  Desc = 'DESC',
}
