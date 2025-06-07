import { Asset } from './asset.dto';

export interface DividendHistoricalPayment {
  id: number;
  asset: Asset;
  assetId: number;
  date: string;
  value: number;
}
