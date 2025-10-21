import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAssetPayout } from '../portfoliosAssetsPayouts/portfolioAssetPayout.entity';

export enum PortfolioAssetMovement {
  Buy = 'Comprar',
  Sell = 'Vender',
  Hold = 'Manter'
}

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

  @Column({ name: 'payouts_received', type: 'decimal', default: 0, transformer })
  payoutsReceived: number;

  @Column({ type: 'decimal', default: 0, transformer })
  taxes: number;

  @Column({ type: 'decimal', default: 0, transformer })
  fees: number;

  @Column({ nullable: true })
  movement?: PortfolioAssetMovement;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.portfolioAssets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id', foreignKeyConstraintName: 'portfolios_assets_portfolio_id_fkey' })
  portfolio?: Portfolio;

  @ManyToOne(() => Asset, (asset) => asset.portfolioAssets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'portfolios_assets_asset_id_fkey' })
  asset?: Asset;

  @OneToMany(() => PortfolioAssetPayout, (portfolioAssetPayout) => portfolioAssetPayout.portfolioAsset)
  payouts?: PortfolioAssetPayout[];

  constructor(
    assetId: number,
    portfolioId: number,
    quantity: number,
    adjustedCost: number,
    cost: number,
    averageCost: number,
    payoutsReceived?: number,
    fees?: number,
    taxes?: number,
    characteristic?: string,
    expectedPercentage?: number
  ) {
    this.assetId = assetId;
    this.portfolioId = portfolioId;
    this.quantity = quantity;
    this.adjustedCost = adjustedCost;
    this.cost = cost;
    this.averageCost = averageCost;
    this.payoutsReceived = payoutsReceived || 0;
    this.fees = fees || 0;
    this.taxes = taxes || 0;
    this.characteristic = characteristic;
    this.expectedPercentage = expectedPercentage;
    this.salesTotal = 0;
  }
}
