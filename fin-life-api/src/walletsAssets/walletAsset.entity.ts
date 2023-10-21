import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

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
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @Column({ nullable: true })
  area?: string;

  @Column({ type: 'enum', enum: WalletAssetCharacteristics, nullable: true })
  characteristic?: WalletAssetCharacteristics;

  @Column({ name: 'expected_percentage', nullable: true })
  expectedPercentage?: number;

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  position: number;

  @Column({ name: 'average_cost' })
  averageCost: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.walletAssets)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'wallets_assets_wallet_id_fkey' })
  wallet?: Wallet;

  @ManyToOne(() => Asset, (asset) => asset.walletAssets)
  @JoinColumn({ name: 'asset_id', foreignKeyConstraintName: 'wallets_assets_asset_id_fkey' })
  asset?: Asset;

  @BeforeInsert()
  @BeforeUpdate()
  public convertPositionToCents(): void {
    this.position = Number((Number(this.position.toFixed(2)) * 100).toFixed(2));
  }

  @AfterLoad()
  public convertPositionToReais(): void {
    this.position = this.position / 100;
  }

  constructor(
    assetId: number,
    walletId: number,
    quantity: number,
    position: number,
    area?: string,
    characteristic?: WalletAssetCharacteristics,
    expectedPercentage?: number
  ) {
    this.assetId = assetId;
    this.walletId = walletId;
    this.quantity = quantity;
    this.position = position;
    this.area = area;
    this.characteristic = characteristic;
    this.expectedPercentage = expectedPercentage;
  }
}
