import { Asset } from './asset.dto';

export interface SplitHistoricalEvent {
  date: string;
  denominator: number;
  numerator: number;
  ratio: string;
  assetId: number;
  asset: Asset;
}
