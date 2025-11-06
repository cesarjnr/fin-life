import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'portfolio_asset_id' })
  @Index('comments_portfolio_asset_id_idx')
  portfolioAssetId: number;

  @Column()
  text: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_asset_id', foreignKeyConstraintName: 'comments_portfolio_asset_id_fkey' })
  portfolioAsset?: PortfolioAsset;

  constructor(portfolioAssetId: number, text: string) {
    this.portfolioAssetId = portfolioAssetId;
    this.text = text;
  }
}
