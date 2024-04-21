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

enum PortfolioAssetCharacteristics {
  Risk = 'risk',
  Growing = 'growing',
  Dividend = 'dividend',
  Security = 'security'
}

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

  @Column({ type: 'enum', enum: PortfolioAssetCharacteristics, nullable: true })
  characteristic?: PortfolioAssetCharacteristics;

  @Column({ name: 'expected_percentage', nullable: true })
  expectedPercentage?: number;

  @Column({ type: 'float' })
  cost: number;

  @Column({ type: 'float' })
  position: number;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ name: 'sales_total', type: 'float', default: 0 })
  salesTotal: number;

  @Column({ name: 'last_split_date', type: 'date', nullable: true })
  lastSplitDate?: string;

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
    this.averageCost = Number(this.averageCost.toFixed(2));
    this.position = Number(this.position.toFixed(2));
    this.salesTotal = Number(this.salesTotal.toFixed(2));
  }

  constructor(
    assetId: number,
    portfolioId: number,
    quantity: number,
    position: number,
    cost: number,
    averageCost: number,
    characteristic?: PortfolioAssetCharacteristics,
    expectedPercentage?: number
  ) {
    this.assetId = assetId;
    this.portfolioId = portfolioId;
    this.quantity = quantity;
    this.position = position;
    this.cost = cost;
    this.averageCost = averageCost;
    this.characteristic = characteristic;
    this.expectedPercentage = expectedPercentage;
    this.salesTotal = 0;
  }
}
