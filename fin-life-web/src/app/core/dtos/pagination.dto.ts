export interface PaginationResponse<T> {
  data: T[];
  itemsPerPage: number;
  page: number;
  total: number;
}