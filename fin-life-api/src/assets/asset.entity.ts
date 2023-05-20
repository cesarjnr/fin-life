import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BuySell } from '../buysSells/buySell.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';

export enum AssetCategories {
  VariableIncome = 'variable_income',
  FixedIncoe = 'fixed_income'
}

export enum AssetClasses {
  Stock = 'stock',
  International = 'international',
  RealState = 'real_state',
  Cash = 'cash',
  Cryptocurrency = 'cryptocurrency'
}

export enum AssetCharacteristics {
  Risk = 'risk',
  Growing = 'growing',
  Dividend = 'dividend',
  Security = 'security'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  ticker: string;

  @Column()
  category: AssetCategories;

  @Column()
  class: AssetClasses;

  @OneToMany(() => BuySell, (buySell) => buySell.asset)
  buysSells?: BuySell[];

  @OneToMany(() => AssetHistoricalPrice, (assetHistoricalPrice) => assetHistoricalPrice.asset)
  assetHistoricalPrices?: AssetHistoricalPrice[];

  // @Column({ nullable: true })
  // area?: string;

  // @Column()
  // characteristic: AssetCharacteristics;

  constructor(
    ticker: string,
    category: AssetCategories,
    assetClass: AssetClasses
    // characteristic: AssetCharacteristics,
    // area?: string
  ) {
    this.ticker = ticker;
    this.category = category;
    this.class = assetClass;
    // this.characteristic = characteristic;
    // this.area = area;
  }
}
