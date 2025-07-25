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

export enum OrderBy {
  Asc = 'ASC',
  Desc = 'DESC'
}
