import {
  AfterLoad,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

import { Wallet } from '../wallets/wallet.entity';

@Entity('quotas')
export class Quota {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'float', default: 1000 })
  quantity: number;

  @Column({ type: 'float' })
  value: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.quotas)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'quotas_wallet_id_fkey' })
  wallet?: Wallet;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.value = Number((Number(this.value.toFixed(2)) * 100).toFixed(2));
  }

  @AfterLoad()
  public convertValueToReais(): void {
    this.value /= 100;
  }

  constructor(walletValue: number, walletId: number, quantity = 1000) {
    this.walletId = walletId;
    this.quantity = quantity;
    this.value = Number((walletValue / this.quantity).toFixed(2));
  }
}
