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
export interface FindRequestParams {
  relations?: {
    name: string;
    orderByColumn?: string;
    orderByDirection?: 'ASC' | 'DESC';
  }[];
}

export enum OrderBy {
  Asc = 'ASC',
  Desc = 'DESC'
}
