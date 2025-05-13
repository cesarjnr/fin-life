import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';

@Entity('portfolios_assets')
export class PortfolioAsset {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'portfolio_id' })
  portfolioId: number;

  @Column({ type: 'decimal', name: 'average_cost', transformer })
  averageCost: number;

  @Column({ nullable: true })
  characteristic?: string;

  @Column({ name: 'expected_percentage', nullable: true })
  expectedPercentage?: number;

  @Column({ type: 'decimal', transformer })
  cost: number;

  @Column({ name: 'adjusted_cost', type: 'decimal', transformer })
  adjustedCost: number;

  @Column({ type: 'decimal', transformer })
  quantity: number;

  @Column({ name: 'sales_total', type: 'decimal', default: 0, transformer })
  salesTotal: number;

  @Column({ name: 'dividends_paid', type: 'decimal', default: 0, transformer })
  dividendsPaid: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.portfolioAssets)
  @JoinColumn({ name: 'portfolio_id', foreignKeyConstraintName: 'portfolios_assets_portfolio_id_fkey' })
  portfolio?: Portfolio;

  @ManyToOne(() => Asset, (asset) => asset.portfolioAssets)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'portfolios_assets_asset_id_fkey' })
  asset?: Asset;

  @OneToMany(() => PortfolioAssetDividend, (portfolioAssetDividend) => portfolioAssetDividend.portfolioAsset)
  dividends?: PortfolioAssetDividend[];

  constructor(
    assetId: number,
    portfolioId: number,
    quantity: number,
    adjustedCost: number,
    cost: number,
    averageCost: number,
    dividendsPaid: number,
    characteristic?: string,
    expectedPercentage?: number
  ) {
    this.assetId = assetId;
    this.portfolioId = portfolioId;
    this.quantity = quantity;
    this.adjustedCost = adjustedCost;
    this.cost = cost;
    this.averageCost = averageCost;
    this.dividendsPaid = dividendsPaid;
    this.characteristic = characteristic;
    this.expectedPercentage = expectedPercentage;
    this.salesTotal = 0;
  }
}
