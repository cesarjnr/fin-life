export interface PaginationParams {
  limit?: string;
  page?: string;
}
export interface PaginationResponse<T> {
  data: T[];
  itemsPerPage: number;
  page: number;
  total: number;
}
