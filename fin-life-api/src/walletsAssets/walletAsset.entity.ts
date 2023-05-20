import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Wallet } from '../wallets/wallet.entity';

@Entity('wallets_assets')
export class WalletAsset {
  @PrimaryColumn({ name: 'asset_id' })
  assetId: number;

  @PrimaryColumn({ name: 'wallet_id' })
  walletId: number;

  @Column({ nullable: true })
  area?: string;

  @Column({ nullable: true })
  characteristic?: string;

  @Column({ name: 'expected_percentage', nullable: true })
  expectedPercentage?: number;

  @Column()
  quantity: number;

  @Column({ name: 'cost' })
  cost: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.walletAssets)
  @JoinColumn({ name: 'wallet_id' })
  wallet?: Wallet;

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
    characteristic?: string,
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
