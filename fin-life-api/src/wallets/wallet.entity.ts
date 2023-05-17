import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { BuySell } from '../buysSells/buySell.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column({ name: 'number_of_quotas', default: 100 })
  numberOfQuotas: number;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User | number;

  @OneToMany(() => BuySell, (buySell) => buySell.wallet)
  buysSells?: BuySell[];

  constructor(description: string, user: User | number) {
    this.description = description;
    this.user = user;
  }
}
