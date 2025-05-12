import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

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

  @Column({ type: 'float', name: 'average_cost' })
  averageCost: number;

  @Column({ nullable: true })
  characteristic?: string;

  @Column({ name: 'expected_percentage', nullable: true })
  expectedPercentage?: number;

  @Column({ type: 'float' })
  cost: number;

  @Column({ name: 'adjusted_cost', type: 'float' })
  adjustedCost: number;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ name: 'sales_total', type: 'float', default: 0 })
  salesTotal: number;

  @Column({ name: 'last_split_date', type: 'date', nullable: true })
  lastSplitDate?: string;

  @Column({ name: 'dividends_paid', default: 0 })
  dividendsPaid: number;

  @Column({
    name: 'suggested_buy',
    type: 'float',
    default: 0,
    comment: 'A suggested amount to buy in case the asset drops above certain percentages'
  })
  suggestedBuy: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.portfolioAssets)
  @JoinColumn({ name: 'portfolio_id', foreignKeyConstraintName: 'portfolios_assets_portfolio_id_fkey' })
  portfolio?: Portfolio;

  @ManyToOne(() => Asset, (asset) => asset.portfolioAssets)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'portfolios_assets_asset_id_fkey' })
  asset?: Asset;

  @OneToMany(() => PortfolioAssetDividend, (portfolioAssetDividend) => portfolioAssetDividend.portfolioAsset)
  dividends?: PortfolioAssetDividend[];

  @BeforeInsert()
  @BeforeUpdate()
  public formatCents(): void {
    this.cost = Number(this.cost.toFixed(2));
    this.averageCost = Number(this.averageCost.toFixed(2));
    this.adjustedCost = Number(this.adjustedCost.toFixed(2));
    this.salesTotal = Number(this.salesTotal.toFixed(2));
  }

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
