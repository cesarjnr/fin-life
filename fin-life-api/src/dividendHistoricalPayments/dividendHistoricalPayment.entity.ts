import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Asset } from '../assets/asset.entity';

@Entity('dividend_historical_payments')
export class DividendHistoricalPayment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  value: number;

  @ManyToOne(() => Asset, (asset) => asset.dividendHistoricalPayments)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'dividend_historical_payments_asset_id_fkey' })
  asset?: Asset;

  constructor(assetId: number, date: string, value: number) {
    this.assetId = assetId;
    this.date = date;
    this.value = value;
  }
}
