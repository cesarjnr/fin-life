import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Asset } from '../assets/asset.entity';

@Entity('asset_historical_prices')
export class AssetHistoricalPrice {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId?: number;

  @Column()
  date: Date;

  @Column({ name: 'closing_price' })
  closingPrice: number;

  @ManyToOne(() => Asset, (asset) => asset.assetHistoricalPrices)
  @JoinColumn({ name: 'asset_id' })
  asset?: Asset;

  @BeforeInsert()
  public convertClosingPriceToCents(): void {
    this.closingPrice = this.closingPrice * 100;
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
