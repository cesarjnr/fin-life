import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { Currencies } from '../common/enums/number';

export enum PayoutTypes {
  Dividend = 'Dividendo',
  JCP = 'JCP',
  Income = 'Rendimento'
}

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'portfolio_asset_id' })
  @Index('payouts_portfolio_asset_id_idx')
  portfolioAssetId: number;

  @Column()
  type: PayoutTypes;

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
    type: 'date',
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

  @ManyToOne(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.payouts, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({
    name: 'portfolio_asset_id',
    foreignKeyConstraintName: 'payouts_portfolio_asset_id_fkey'
  })
  portfolioAsset?: PortfolioAsset;

  constructor(
    portfolioAssetId: number,
    type: PayoutTypes,
    date: string,
    quantity: number,
    value: number,
    taxes: number,
    total: number,
    currency: Currencies,
    receivedDateExchangeRate: number,
    withdrawalDate?: string,
    withdrawalDateExchangeRate?: number
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
    this.withdrawalDate = withdrawalDate;
    this.withdrawalDateExchangeRate = withdrawalDateExchangeRate;
  }
}
