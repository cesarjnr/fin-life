import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { DateIntervals } from '../common/enums/date';
import { transformer } from '../common/helpers/database.helper';

export enum MarketIndexTypes {
  Rate = 'rate',
  Point = 'point',
  Currency = 'currency'
}

@Index('market_index_historical_data_ticker_date_idx', ['ticker', 'date'])
@Entity('market_index_historical_data')
export class MarketIndexHistoricalData {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  interval: DateIntervals;

  @Column()
  ticker: string;

  @Column()
  type: MarketIndexTypes;

  @Column({ type: 'decimal', transformer })
  value: number;

  constructor(date: string, ticker: string, interval: DateIntervals, type: MarketIndexTypes, value: number) {
    this.date = date;
    this.ticker = ticker;
    this.interval = interval;
    this.type = type;
    this.value = value;
  }
}
