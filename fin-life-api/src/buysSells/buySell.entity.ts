import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'decimal', comment: 'Quantity the user is buying/selling' })
  quantity: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'decimal', default: 0 })
  fees: number;

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

  @BeforeInsert()
  public formatCents(): void {
    this.price = Number(this.price.toFixed(2));

    if (this.fees) {
      this.fees = Number(this.fees.toFixed(2));
    }
  }

  constructor(
    quantity: number,
    price: number,
    type: BuySellTypes,
    date: string,
    institution: string,
    assetId: number,
    portfolioId: number,
    fees?: number
  ) {
    this.quantity = quantity;
    this.price = price;
    this.type = type;
    this.date = date;
    this.institution = institution;
    this.assetId = assetId;
    this.portfolioId = portfolioId;
    this.fees = fees;
  }
}
