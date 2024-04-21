import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Portfolio } from '../portfolios/portfolio.entity';

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

  @Column({ name: 'portfolio_id' })
  portfolioId: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.quotas)
  @JoinColumn({ name: 'portfolio_id', foreignKeyConstraintName: 'quotas_portfolio_id_fkey' })
  portfolio?: Portfolio;

  @BeforeInsert()
  @BeforeUpdate()
  public formatCents(): void {
    this.quantity = Number(this.quantity.toFixed(2));
    this.value = Number(this.value.toFixed(2));
  }

  constructor(date: string, portfolioValue: number, portfolioId: number, quantity = 1000) {
    this.date = date;
    this.portfolioId = portfolioId;
    this.quantity = quantity;
    this.value = portfolioValue / this.quantity;
  }
}
