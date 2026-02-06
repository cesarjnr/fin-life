import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DateIntervals } from '../common/enums/date';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { transformer } from '../common/helpers/database.helper';

export enum MarketIndexTypes {
  Rate = 'rate',
  Currency = 'currency'
}

@Entity('market_indexes')
export class MarketIndex {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  code: string;

  @Column()
  interval: DateIntervals;

  @Column()
  type: MarketIndexTypes;

  @Column({ type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'all_time_high_value', type: 'decimal', default: 0, transformer })
  allTimeHighValue: number;

  @OneToMany(() => MarketIndexHistoricalData, (marketIndexHistoricalData) => marketIndexHistoricalData.marketIndex)
  marketIndexHistoricalData?: MarketIndexHistoricalData[];

  constructor(code: string, interval: DateIntervals, type: MarketIndexTypes, allTimeHighValue?: number) {
    this.code = code;
    this.interval = interval;
    this.type = type;
    this.allTimeHighValue = allTimeHighValue || 0;
    this.active = true;
  }
}
