import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

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
  fees: number;

  @Column({ type: 'decimal', transformer })
  total: number;

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
    fees: number = 0,
    total: number
  ) {
    this.portfolioAssetId = portfolioAssetId;
    this.type = type;
    this.date = date;
    this.quantity = quantity;
    this.value = value;
    this.fees = fees;
    this.total = total;
  }
}
