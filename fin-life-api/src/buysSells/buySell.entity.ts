import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { Asset } from '../assets/asset.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

export enum BuySellTypes {
  Buy = 'buy',
  Sell = 'sell'
}

@Index('buys_sells_asset_id_portfolio_id_idx', ['assetId', 'portfolioId'])
@Entity('buys_sells')
export class BuySell {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'decimal', comment: 'Quantity the user is buying/selling', transformer })
  quantity: number;

  @Column({ name: 'asset_id' })
  assetId: number;

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
  type: BuySellTypes;

  @Column()
  institution: string;

  @Column({ name: 'portfolio_id' })
  portfolioId: number;

  @ManyToOne(() => Asset, (asset) => asset.buysSells)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'buys_sells_asset_id_fkey' })
  asset?: Asset;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.buysSells)
  @JoinColumn({ name: 'portfolio_id', foreignKeyConstraintName: 'buys_sells_portfolio_id_fkey' })
  portfolio?: Portfolio;

  constructor(
    quantity: number,
    price: number,
    type: BuySellTypes,
    date: string,
    institution: string,
    assetId: number,
    portfolioId: number,
    fees: number,
    total: number,
    exchangeRate: number
  ) {
    this.quantity = quantity;
    this.price = price;
    this.type = type;
    this.date = date;
    this.institution = institution;
    this.assetId = assetId;
    this.portfolioId = portfolioId;
    this.fees = fees;
    this.total = total;
    this.exchangeRate = exchangeRate;
  }
}
