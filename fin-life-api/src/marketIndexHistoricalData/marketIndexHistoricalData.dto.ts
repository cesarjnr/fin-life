import { GetRequestParams } from '../common/dto/request';

export type GetMarketIndexHistoricalDataDto = GetRequestParams & { marketIndexId: number; from?: string; to?: string };
