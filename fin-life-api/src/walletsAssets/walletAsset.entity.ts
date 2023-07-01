import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Wallet } from '../wallets/wallet.entity';
import { Asset } from '../assets/asset.entity';

enum WalletAssetCharacteristics {
  Risk = 'risk',
  Growing = 'growing',
  Dividend = 'dividend',
  Security = 'security'
}

@Entity('wallets_assets')
export class WalletAsset {
  @PrimaryColumn({ name: 'asset_id' })
  assetId: number;

  @PrimaryColumn({ name: 'wallet_id' })
  walletId: number;

  @Column({ nullable: true })
  area?: string;

  @Column({ type: 'enum', enum: WalletAssetCharacteristics, nullable: true })
  characteristic?: WalletAssetCharacteristics;

  @Column({ name: 'expected_percentage', nullable: true })
  expectedPercentage?: number;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ name: 'cost' })
  cost: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.walletAssets)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'wallets_assets_wallet_id_fkey' })
  wallet?: Wallet;

  @ManyToOne(() => Asset, (asset) => asset.walletAssets)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'wallets_assets_asset_id_fkey' })
  asset?: Asset;

  @BeforeInsert()
  public convertCostToCents(): void {
    this.cost = this.cost * 100;
  }

  @AfterLoad()
  public convertCostToReais(): void {
    this.cost = this.cost / 100;
  }

  constructor(
    assetId: number,
    walletId: number,
    quantity: number,
    cost: number,
    area?: string,
    characteristic?: WalletAssetCharacteristics,
    expectedPercentage?: number
  ) {
    this.assetId = assetId;
    this.walletId = walletId;
    this.quantity = quantity;
    this.cost = cost;
    this.area = area;
    this.characteristic = characteristic;
    this.expectedPercentage = expectedPercentage;
  }
}
