import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { Currencies } from '../common/enums/number';

export enum PortfolioAssetDividendTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento'
}

@Entity('portfolios_assets_dividends')
export class PortfolioAssetDividend {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'portfolio_asset_id' })
  @Index('portfolios_assets_dividends_portfolio_asset_id_idx')
  portfolioAssetId: number;

  @Column()
  type: PortfolioAssetDividendTypes;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', transformer })
  quantity: number;

  @Column({ type: 'decimal', transformer })
  value: number;

  @Column({ type: 'decimal', default: 0, transformer })
  taxes: number;

  @Column({ type: 'decimal', transformer })
  total: number;

  @Column({ type: 'varchar', length: 3 })
  currency: Currencies;

  @Column({
    name: 'received_date_exchange_rate',
    comment: 'Exchange rate on the date of receipt',
    type: 'decimal',
    default: 0,
    transformer
  })
  receivedDateExchangeRate: number;

  @Column({
    name: 'withdrawal_date',
    comment: 'Date of withdrawal',
    nullable: true
  })
  withdrawalDate: string;

  @Column({
    name: 'withdrawal_date_exchange_rate',
    comment: 'Exchange rate on the date of withdrawal',
    type: 'decimal',
    default: 0,
    transformer
  })
  withdrawalDateExchangeRate: number;

  @ManyToOne(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.dividends)
  @JoinColumn({
    name: 'portfolio_asset_id',
    foreignKeyConstraintName: 'portfolios_assets_dividends_portfolio_asset_id_fkey'
  })
  portfolioAsset?: PortfolioAsset;

  constructor(
    portfolioAssetId: number,
    type: PortfolioAssetDividendTypes,
    date: string,
    quantity: number,
    value: number,
    taxes: number,
    total: number,
    currency: Currencies,
    receivedDateExchangeRate: number,
    withdrawalDateExchangeRate: number
  ) {
    this.portfolioAssetId = portfolioAssetId;
    this.type = type;
    this.date = date;
    this.quantity = quantity;
    this.value = value;
    this.taxes = taxes;
    this.total = total;
    this.currency = currency;
    this.receivedDateExchangeRate = receivedDateExchangeRate;
    this.withdrawalDateExchangeRate = withdrawalDateExchangeRate;
  }
}
