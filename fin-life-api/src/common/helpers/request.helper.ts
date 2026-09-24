import { BadRequestException } from '@nestjs/common';

import { GetRequestParams, NormalizedPaginationParams, OrderBy } from '../dto/request';

export const normalizePaginationParams = (
  getRequestParams: GetRequestParams,
  databaseTableAlias: string,
  orderByDefaultColumn: string,
  allowedOrderByColumns: string[]
): NormalizedPaginationParams => {
  const page = getRequestParams.page ? Number(getRequestParams.page) : null;
  const limit = getRequestParams.limit && getRequestParams.limit !== '0' ? Number(getRequestParams.limit) : null;
  const orderByColumn = validateOrderByColumn(
    getRequestParams.orderByColumn,
    allowedOrderByColumns,
    orderByDefaultColumn
  );
  const orderBy = validateOrderBy(getRequestParams.orderBy);

  return { page, limit, orderByColumn: `${databaseTableAlias}.${orderByColumn}`, orderBy };
};

export const validateOrderByColumn = (
  requestedColumn: string | undefined,
  allowedColumns: string[],
  defaultColumn: string
): string => {
  if (!requestedColumn) {
    return defaultColumn;
  }

  if (!allowedColumns.includes(requestedColumn)) {
    throw new BadRequestException(`orderByColumn must be one of: ${allowedColumns.join(', ')}`);
  }

  return requestedColumn;
};

export const validateOrderBy = (requestedOrderBy?: OrderBy): OrderBy => {
  if (!requestedOrderBy) {
    return OrderBy.Asc;
  }

  if (!Object.values(OrderBy).includes(requestedOrderBy)) {
    throw new BadRequestException('orderBy must be one of: ASC, DESC');
  }

  return requestedOrderBy;
};
