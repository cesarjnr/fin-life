import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BuySell } from '../buysSells/buySell.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { DividendHistoricalPayment } from '../dividendHistoricalPayments/dividendHistoricalPayment.entity';
import { SplitHistoricalEvent } from '../splitHistoricalEvents/splitHistoricalEvent.entity';

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncome = 'Renda Fixa'
}
export enum AssetClasses {
  Stock = 'Ação',
  International = 'Internacional',
  RealState = 'Imobiliário',
  Cash = 'Caixa',
  Cryptocurrency = 'Criptomoeda'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  ticker: string;

  @Column()
  category: string;

  @Column()
  class: string;

  @Column()
  sector: string;

  @Column({ type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'all_time_high_price', type: 'float' })
  allTimeHighPrice: number;

  @OneToMany(() => BuySell, (buySell) => buySell.asset)
  buysSells?: BuySell[];

  @OneToMany(() => AssetHistoricalPrice, (assetHistoricalPrice) => assetHistoricalPrice.asset)
  assetHistoricalPrices?: AssetHistoricalPrice[];

  @OneToMany(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.asset)
  portfolioAssets?: PortfolioAsset[];

  @OneToMany(() => DividendHistoricalPayment, (dividendHistoricalPayment) => dividendHistoricalPayment.asset)
  dividendHistoricalPayments?: DividendHistoricalPayment[];

  @OneToMany(() => SplitHistoricalEvent, (splitHistoricalEvent) => splitHistoricalEvent.asset)
  splitHistoricalEvents?: SplitHistoricalEvent[];

  constructor(
    ticker: string,
    category: AssetCategories,
    assetClass: AssetClasses,
    sector: string,
    allTimeHighPrice: number
  ) {
    this.ticker = ticker;
    this.category = category;
    this.class = assetClass;
    this.sector = sector;
    this.allTimeHighPrice = allTimeHighPrice;
    this.active = true;
  }
}
