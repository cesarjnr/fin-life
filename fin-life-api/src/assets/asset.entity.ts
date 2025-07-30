import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { BuySell } from '../buysSells/buySell.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { DividendHistoricalPayment } from '../dividendHistoricalPayments/dividendHistoricalPayment.entity';
import { SplitHistoricalEvent } from '../splitHistoricalEvents/splitHistoricalEvent.entity';
import { Currencies } from '../common/enums/number';

export enum AssetCategories {
  VariableIncome = 'Renda Variável',
  FixedIncome = 'Renda Fixa'
}
export enum AssetClasses {
  Stock = 'Ação',
  International = 'Internacional',
  RealState = 'Fundo Imobiliário',
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
  category: AssetCategories;

  @Column()
  class: AssetClasses;

  @Column()
  sector: string;

  @Column({ type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'all_time_high_price', type: 'decimal', default: 0, transformer })
  allTimeHighPrice: number;

  @Column({ type: 'varchar', length: 3 })
  currency: Currencies;

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
    currency: Currencies,
    allTimeHighPrice?: number
  ) {
    this.ticker = ticker;
    this.category = category;
    this.class = assetClass;
    this.sector = sector;
    this.currency = currency;
    this.allTimeHighPrice = allTimeHighPrice;
    this.active = true;
  }
}
