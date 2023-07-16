import {
  AfterLoad,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '../users/user.entity';
import { BuySell } from '../buysSells/buySell.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column({ name: 'number_of_quotas', type: 'float', default: 1000 })
  numberOfQuotas: number;

  @Column({ name: 'quota_initial_value', default: 0 })
  quotaInitialValue: number;

  @Column({ name: 'wallet_initial_value', default: 0 })
  walletInitialValue: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'wallets_user_id_fkey' })
  user?: User;

  @OneToMany(() => BuySell, (buySell) => buySell.wallet)
  buysSells?: BuySell[];

  @OneToMany(() => WalletAsset, (walletAsset) => walletAsset.wallet)
  walletAssets?: WalletAsset[];

  @BeforeUpdate()
  public convertQuotaInitialValueToCents(): void {
    this.quotaInitialValue = Number((Number(this.quotaInitialValue.toFixed(2)) * 100).toFixed(2));
    this.walletInitialValue = Number((Number(this.walletInitialValue.toFixed(2)) * 100).toFixed(2));
  }

  @AfterLoad()
  public convertValuesToReais(): void {
    this.quotaInitialValue /= 100;
    this.walletInitialValue /= 100;
  }

  constructor(description: string, userId: number) {
    this.description = description;
    this.numberOfQuotas = 1000;
    this.quotaInitialValue = 0;
    this.userId = userId;
    this.walletInitialValue = 0;
  }
}
