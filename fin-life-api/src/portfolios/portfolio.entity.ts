import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../users/user.entity';
import { BuySell } from '../buysSells/buySell.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.portfolios)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'portfolios_user_id_fkey' })
  user?: User;

  @OneToMany(() => BuySell, (buySell) => buySell.portfolio)
  buysSells?: BuySell[];

  @OneToMany(() => PortfolioAsset, (portfolioAsset) => portfolioAsset.portfolio)
  portfolioAssets?: PortfolioAsset[];

  constructor(description: string, userId: number) {
    this.description = description;
    this.userId = userId;
  }
}
