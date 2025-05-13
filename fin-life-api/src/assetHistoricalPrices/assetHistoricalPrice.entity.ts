import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Asset } from '../assets/asset.entity';

@Index('asset_historical_prices_asset_id_date_idx', ['assetId', 'date'])
@Entity('asset_historical_prices')
export class AssetHistoricalPrice {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'closing_price', type: 'decimal' })
  closingPrice: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Asset, (asset) => asset.assetHistoricalPrices)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'asset_historical_prices_asset_id_fkey' })
  asset?: Asset;

  constructor(assetId: number, date: string, closingPrice: number) {
    this.assetId = assetId;
    this.date = date;
    this.closingPrice = closingPrice;
  }
}
