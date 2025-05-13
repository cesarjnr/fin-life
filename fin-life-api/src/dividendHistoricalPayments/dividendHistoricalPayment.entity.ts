import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { Asset } from '../assets/asset.entity';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';

@Index('dividend_historical_payments_asset_id_date_idx', ['assetId', 'date'])
@Entity('dividend_historical_payments')
export class DividendHistoricalPayment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', transformer })
  value: number;

  @ManyToOne(() => Asset, (asset) => asset.dividendHistoricalPayments)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'dividend_historical_payments_asset_id_fkey' })
  asset?: Asset;

  @OneToMany(() => PortfolioAssetDividend, (portfolioAssetDividend) => portfolioAssetDividend.dividendHistoricalPayment)
  portfolioAssetDividends: PortfolioAssetDividend[];

  constructor(assetId: number, date: string, value: number) {
    this.assetId = assetId;
    this.date = date;
    this.value = value;
  }
}
