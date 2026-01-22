import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { DateIntervals } from '../common/enums/date';
import { transformer } from '../common/helpers/database.helper';

export enum MarketIndexTypes {
  Rate = 'rate',
  Point = 'point',
  Currency = 'currency'
}

@Index('market_index_historical_data_code_date_idx', ['code', 'date'])
@Entity('market_index_historical_data')
export class MarketIndexHistoricalData {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  interval: DateIntervals;

  @Column()
  code: string;

  @Column()
  type: MarketIndexTypes;

  @Column({ type: 'decimal', transformer })
  value: number;

  constructor(date: string, code: string, interval: DateIntervals, type: MarketIndexTypes, value: number) {
    this.date = date;
    this.code = code;
    this.interval = interval;
    this.type = type;
    this.value = value;
  }
}
