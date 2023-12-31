import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Wallet } from '../wallets/wallet.entity';

@Entity('quotas')
export class Quota {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float', default: 1000 })
  quantity: number;

  @Column({ type: 'float' })
  value: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.quotas)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'quotas_wallet_id_fkey' })
  wallet?: Wallet;

  @BeforeInsert()
  @BeforeUpdate()
  public formatCents(): void {
    this.quantity = Number(this.quantity.toFixed(2));
    this.value = Number(this.value.toFixed(2));
  }

  constructor(date: string, walletValue: number, walletId: number, quantity = 1000) {
    this.date = date;
    this.walletId = walletId;
    this.quantity = quantity;
    this.value = walletValue / this.quantity;
  }
}
