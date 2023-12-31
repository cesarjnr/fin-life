import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { WalletAsset } from '../walletsAssets/walletAsset.entity';

@Entity('wallets_assets_dividends')
export class WalletAssetDividend {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'wallet_asset_id' })
  walletAssetId: number;

  @Column({ name: 'dividend_historical_payment_id' })
  dividendHistoricalPaymentId: number;

  @Column({ name: 'shares_amount' })
  sharesAmount: number;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'float' })
  total: number;

  @ManyToOne(() => WalletAsset, (walletAsset) => walletAsset.dividends)
  @JoinColumn({ name: 'wallet_asset_id', foreignKeyConstraintName: 'wallets_assets_dividends_wallet_id_fkey' })
  walletAsset?: WalletAsset;

  @BeforeInsert()
  public formatCents() {
    this.total = Number(this.total.toFixed(2));
  }

  constructor(walletAssetId: number, dividendHistoricalPaymentId: number, sharesAmount: number, value: number) {
    this.walletAssetId = walletAssetId;
    this.dividendHistoricalPaymentId = dividendHistoricalPaymentId;
    this.sharesAmount = sharesAmount;
    this.value = value;
    this.total = sharesAmount * value;
  }
}
