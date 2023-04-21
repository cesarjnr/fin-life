import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { BuySell } from '../buysSells/buySell.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'number_of_quotas' })
  numberOfQuotas: number;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User | number;

  @OneToMany(() => BuySell, (buySell) => buySell.wallet)
  buysSells?: BuySell[];

  constructor(numberOfQuotas: number, user: User | number) {
    this.numberOfQuotas = numberOfQuotas;
    this.user = user;
  }
}
