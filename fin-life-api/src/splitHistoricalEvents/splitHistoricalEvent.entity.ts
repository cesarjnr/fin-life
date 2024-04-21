import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from '../assets/asset.entity';

@Entity('split_historical_events')
export class SplitHistoricalEvent {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  @Index('split_historical_events_asset_id_idx')
  assetId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  numerator: number;

  @Column({ type: 'float' })
  denominator: number;

  @Column()
  ratio: string;

  @ManyToOne(() => Asset, (asset) => asset.splitHistoricalEvents)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'split_historical_events_asset_id_fkey' })
  asset?: Asset;

  constructor(assetId: number, date: string, numerator: number, denominator: number, ratio: string) {
    this.assetId = assetId;
    this.date = date;
    this.numerator = numerator;
    this.denominator = denominator;
    this.ratio = ratio;
  }
}
