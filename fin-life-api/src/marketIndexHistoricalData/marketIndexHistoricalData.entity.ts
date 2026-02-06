import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { MarketIndex } from '../marketIndexes/marketIndex.entity';

@Index('market_index_historical_data_market_index_id_date_idx', ['marketIndexId', 'date'])
@Entity('market_index_historical_data')
export class MarketIndexHistoricalData {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'market_index_id' })
  marketIndexId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', transformer })
  value: number;

  @ManyToOne(() => MarketIndex, (marketIndex) => marketIndex.marketIndexHistoricalData, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'market_index_id',
    foreignKeyConstraintName: 'market_index_historical_data_market_index_id_fkey'
  })
  marketIndex?: MarketIndex;

  constructor(marketIndexId: number, date: string, value: number) {
    this.marketIndexId = marketIndexId;
    this.date = date;
    this.value = value;
  }
}
