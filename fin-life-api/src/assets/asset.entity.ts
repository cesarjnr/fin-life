import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
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

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  category: AssetCategories;

  @Column()
  class: AssetClasses;

  @Column({ nullable: true })
  sector?: string;

  @Column({ type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'all_time_high_price', type: 'decimal', default: 0, transformer })
  allTimeHighPrice: number;

  @Column({ type: 'varchar', length: 3 })
  currency: Currencies;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string;

  @Column({ type: 'decimal', nullable: true, transformer })
  rate?: number;

  @Column({ type: 'varchar' })
  index?: string;

  @OneToMany(() => AssetHistoricalPrice, (assetHistoricalPrice) => assetHistoricalPrice.asset)
  assetHistoricalPrices?: AssetHistoricalPrice[];

  @OneToMany(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.asset)
  portfolioAssets?: PortfolioAsset[];

  @OneToMany(() => DividendHistoricalPayment, (dividendHistoricalPayment) => dividendHistoricalPayment.asset)
  dividendHistoricalPayments?: DividendHistoricalPayment[];

  @OneToMany(() => SplitHistoricalEvent, (splitHistoricalEvent) => splitHistoricalEvent.asset)
  splitHistoricalEvents?: SplitHistoricalEvent[];

  constructor(
    name: string,
    code: string,
    category: AssetCategories,
    assetClass: AssetClasses,
    currency: Currencies,
    sector?: string,
    startDate?: string,
    rate?: number,
    index?: string,
    allTimeHighPrice?: number
  ) {
    this.name = name;
    this.code = code;
    this.category = category;
    this.class = assetClass;
    this.currency = currency;
    this.sector = sector;
    this.startDate = startDate;
    this.rate = rate ? rate / 100 : undefined;
    this.index = index;
    this.allTimeHighPrice = allTimeHighPrice || 0;
    this.active = true;
  }
}
