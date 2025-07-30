import { GetRequestParams } from 'src/common/dto/request';

export type GetAssetHistoricalPricesDto = GetRequestParams & {
  assetId: number;
};
