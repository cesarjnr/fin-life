import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../users/user.entity';
import { BuySell } from '../buysSells/buySell.entity';
import { WalletAsset } from '../walletsAssets/walletAsset.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column({ name: 'number_of_quotas', default: 100 })
  numberOfQuotas: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => BuySell, (buySell) => buySell.wallet)
  buysSells?: BuySell[];

  @OneToMany(() => WalletAsset, (walletAsset) => walletAsset.wallet)
  walletAssets?: WalletAsset[];

  constructor(description: string, userId: number) {
    this.description = description;
    this.numberOfQuotas = 100;
    this.userId = userId;
  }
}
