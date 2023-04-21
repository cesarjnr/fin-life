import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { User } from '../users/user.entity';
import { Expense } from '../expenses/expense.entity';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column({ name: 'revenue_percentage' })
  revenuePercentage: number;

  @ManyToOne(() => User, (user) => user.expenseCategories)
  @JoinColumn({ name: 'user_id' })
  user: User | number;

  @OneToMany(() => Expense, (expense) => expense.expenseCategory)
  expenses?: Expense[];

  constructor(description: string, revenuePercentage: number, user: number) {
    this.description = description;
    this.revenuePercentage = revenuePercentage;
    this.user = user;
  }
}
