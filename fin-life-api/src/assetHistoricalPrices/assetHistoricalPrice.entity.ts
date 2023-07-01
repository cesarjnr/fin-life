import { AfterLoad, BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Asset } from '../assets/asset.entity';

@Index('asset_historical_prices_asset_id_date_idx', ['assetId', 'date'])
@Entity('asset_historical_prices')
export class AssetHistoricalPrice {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'closing_price' })
  closingPrice: number;

  @ManyToOne(() => Asset, (asset) => asset.assetHistoricalPrices)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'asset_historical_prices_asset_id_fkey' })
  asset?: Asset;

  @BeforeInsert()
  public convertClosingPriceToCents(): void {
    this.closingPrice = Number((Number(this.closingPrice.toFixed(2)) * 100).toFixed(2));
  }

  @AfterLoad()
  public convertClosingPriceToReais(): void {
    this.closingPrice = this.closingPrice / 100;
  }

  constructor(assetId: number, date: Date, closingPrice: number) {
    this.assetId = assetId;
    this.date = date;
    this.closingPrice = closingPrice;
  }
}
