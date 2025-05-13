import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { transformer } from '../common/helpers/database.helper';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { DividendHistoricalPayment } from '../dividendHistoricalPayments/dividendHistoricalPayment.entity';

@Entity('portfolios_assets_dividends')
export class PortfolioAssetDividend {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'portfolio_asset_id' })
  @Index('portfolios_assets_dividends_portfolio_asset_id_idx')
  portfolioAssetId: number;

  @Column({ name: 'dividend_historical_payment_id' })
  dividendHistoricalPaymentId: number;

  @Column({ name: 'shares_amount', type: 'decimal', transformer })
  sharesAmount: number;

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

  @ManyToOne(
    () => DividendHistoricalPayment,
    (dividendHistoricalPayment) => dividendHistoricalPayment.portfolioAssetDividends
  )
  @JoinColumn({
    name: 'dividend_historical_payment_id',
    foreignKeyConstraintName: 'portfolios_assets_dividends_dividend_historical_payment_id_fkey'
  })
  dividendHistoricalPayment?: DividendHistoricalPayment;

  constructor(portfolioAssetId: number, dividendHistoricalPaymentId: number, sharesAmount: number, value: number) {
    this.portfolioAssetId = portfolioAssetId;
    this.dividendHistoricalPaymentId = dividendHistoricalPaymentId;
    this.sharesAmount = sharesAmount;
    this.value = value;
    this.total = sharesAmount * value;
  }
}
