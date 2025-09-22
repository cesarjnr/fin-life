import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { Asset } from '../assets/asset.entity';

@Index('dividend_historical_payments_asset_id_date_idx', ['assetId', 'date'])
@Entity('dividend_historical_payments')
export class DividendHistoricalPayment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', transformer })
  value: number;

  @ManyToOne(() => Asset, (asset) => asset.dividendHistoricalPayments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'dividend_historical_payments_asset_id_fkey' })
  asset?: Asset;

  constructor(assetId: number, date: string, value: number) {
    this.assetId = assetId;
    this.date = date;
    this.value = value;
  }
}
