import { GetRequestParams, NormalizedPaginationParams, OrderBy } from '../dto/request';

export const normalizePaginationParams = (
  getRequestParams: GetRequestParams,
  databaseTableAlias: string,
  orderByDefaultColumn: string
): NormalizedPaginationParams => {
  const page = getRequestParams.page ? Number(getRequestParams.page) : null;
  const limit = getRequestParams.limit && getRequestParams.limit !== '0' ? Number(getRequestParams.limit) : null;
  const orderByColumn = `${databaseTableAlias}.${getRequestParams.orderByColumn ?? orderByDefaultColumn}`;
  const orderBy = getRequestParams.orderBy ?? OrderBy.Asc;

  return { page, limit, orderByColumn, orderBy };
};
