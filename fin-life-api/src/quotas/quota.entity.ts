import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Wallet } from '../wallets/wallet.entity';

@Entity('quotas')
export class Quota {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  value: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.quotas)
  @JoinColumn({ name: 'wallet_id', foreignKeyConstraintName: 'quotas_wallet_id_fkey' })
  wallet?: Wallet;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.value = Number((Number(this.value.toFixed(2)) * 100).toFixed(2));
  }

  @AfterLoad()
  public convertValueToReais(): void {
    this.value /= 100;
  }

  constructor(date: string, quantity: number, value: number, walletId: number) {
    this.date = date;
    this.quantity = quantity;
    this.value = value;
    this.walletId = walletId;
  }
}
