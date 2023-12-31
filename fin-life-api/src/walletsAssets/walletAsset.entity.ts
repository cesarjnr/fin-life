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

import { Wallet } from '../wallets/wallet.entity';
import { Asset } from '../assets/asset.entity';
import { WalletAssetDividend } from '../walletsAssetsDividends/walletAssetDividend.entity';

enum WalletAssetCharacteristics {
  Risk = 'risk',
  Growing = 'growing',
  Dividend = 'dividend',
  Security = 'security'
}

@Entity('wallets_assets')
export class WalletAsset {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @Column({ type: 'float', name: 'average_cost' })
  averageCost: number;

  @Column({ type: 'enum', enum: WalletAssetCharacteristics, nullable: true })
  characteristic?: WalletAssetCharacteristics;

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

  @ManyToOne(() => Wallet, (wallet) => wallet.walletAssets)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'wallets_assets_wallet_id_fkey' })
  wallet?: Wallet;

  @ManyToOne(() => Asset, (asset) => asset.walletAssets)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'wallets_assets_asset_id_fkey' })
  asset?: Asset;

  @OneToMany(() => WalletAssetDividend, (walletAssetDividend) => walletAssetDividend.walletAsset)
  dividends?: WalletAssetDividend[];

  @BeforeInsert()
  @BeforeUpdate()
  public formatCents(): void {
    this.averageCost = Number(this.averageCost.toFixed(2));
    this.position = Number(this.position.toFixed(2));
    this.salesTotal = Number(this.salesTotal.toFixed(2));
  }

  constructor(
    assetId: number,
    walletId: number,
    quantity: number,
    position: number,
    cost: number,
    averageCost: number,
    characteristic?: WalletAssetCharacteristics,
    expectedPercentage?: number
  ) {
    this.assetId = assetId;
    this.walletId = walletId;
    this.quantity = quantity;
    this.position = position;
    this.cost = cost;
    this.averageCost = averageCost;
    this.characteristic = characteristic;
    this.expectedPercentage = expectedPercentage;
    this.salesTotal = 0;
  }
}
