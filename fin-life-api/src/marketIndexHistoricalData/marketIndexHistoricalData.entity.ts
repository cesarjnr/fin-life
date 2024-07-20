import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { DataIntervals } from '../common/enums/interval';

export enum MarketIndexTypes {
  Rate = 'rate',
  Point = 'point'
}

@Index('market_index_historical_data_ticker_date_idx', ['ticker', 'date'])
@Entity('market_index_historical_data')
export class MarketIndexHistoricalData {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: DataIntervals })
  interval: DataIntervals;

  @Column()
  ticker: string;

  @Column({ type: 'enum', enum: MarketIndexTypes })
  type: MarketIndexTypes;

  @Column({ type: 'float' })
  value: number;

  constructor(date: string, ticker: string, interval: DataIntervals, type: MarketIndexTypes, value: number) {
    this.date = date;
    this.ticker = ticker;
    this.interval = interval;
    this.type = type;
    this.value = value;
  }
}
