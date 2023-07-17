import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../users/user.entity';
import { BuySell } from '../buysSells/buySell.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';
import { Quota } from '../quotas/quota.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'wallets_user_id_fkey' })
  user?: User;

  @OneToMany(() => BuySell, (buySell) => buySell.wallet)
  buysSells?: BuySell[];

  @OneToMany(() => WalletAsset, (walletAsset) => walletAsset.wallet)
  walletAssets?: WalletAsset[];

  @OneToMany(() => Quota, (quota) => quota.wallet)
  quotas?: Quota[];

  constructor(description: string, userId: number) {
    this.description = description;
    this.userId = userId;
  }
}
