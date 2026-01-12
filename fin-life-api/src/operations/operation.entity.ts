import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { Currencies } from '../common/enums/number';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

export enum OperationTypes {
  Buy = 'Compra',
  Sell = 'Venda'
}

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'portfolio_asset_id' })
  @Index('payouts_portfolio_asset_id_idx')
  portfolioAssetId?: number;

  @Column({ type: 'decimal', comment: 'Quantity the user is buying/selling', transformer })
  quantity: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', transformer })
  price: number;

  @Column({ type: 'decimal', default: 0, transformer })
  fees: number;

  @Column({ type: 'decimal', default: 0, transformer })
  taxes: number;

  @Column({ type: 'decimal', transformer })
  total: number;

  @Column({ name: 'exchange_rate', type: 'decimal', default: 0, transformer })
  exchangeRate: number;

  @Column()
  type: OperationTypes;

  @Column()
  institution: string;

  @Column({ type: 'varchar', length: 3 })
  currency: Currencies;

  @ManyToOne(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.operations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_asset_id', foreignKeyConstraintName: 'operations_portfolio_asset_id_fkey' })
  portfolioAsset?: PortfolioAsset;

  constructor(
    quantity: number,
    price: number,
    type: OperationTypes,
    date: string,
    institution: string,
    fees: number,
    taxes: number,
    total: number,
    exchangeRate: number,
    currency: Currencies,
    portfolioAssetId?: number
  ) {
    this.quantity = quantity;
    this.price = price;
    this.type = type;
    this.date = date;
    this.institution = institution;
    this.fees = fees || 0;
    this.taxes = taxes || 0;
    this.total = total;
    this.exchangeRate = exchangeRate;
    this.currency = currency;
    this.portfolioAssetId = portfolioAssetId;
  }
}
