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

  @OneToMany(() => AssetHistoricalPrice, (assetHistoricalPrice) => assetHistoricalPrice.asset)
  assetHistoricalPrices?: AssetHistoricalPrice[];

  @OneToMany(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.asset)
  portfolioAssets?: PortfolioAsset[];

  @OneToMany(() => DividendHistoricalPayment, (dividendHistoricalPayment) => dividendHistoricalPayment.asset)
  dividendHistoricalPayments?: DividendHistoricalPayment[];

  @OneToMany(() => SplitHistoricalEvent, (splitHistoricalEvent) => splitHistoricalEvent.asset)
  splitHistoricalEvents?: SplitHistoricalEvent[];

  constructor(
    code: string,
    category: AssetCategories,
    assetClass: AssetClasses,
    currency: Currencies,
    sector?: string,
    allTimeHighPrice?: number
  ) {
    this.code = code;
    this.category = category;
    this.class = assetClass;
    this.currency = currency;
    this.sector = sector;
    this.allTimeHighPrice = allTimeHighPrice;
    this.active = true;
  }
}
