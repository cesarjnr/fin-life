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

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.expenseCategories)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => Expense, (expense) => expense.expenseCategory)
  expenses?: Expense[];

  constructor(description: string, revenuePercentage: number, userId: number) {
    this.description = description;
    this.revenuePercentage = revenuePercentage;
    this.userId = userId;
  }
}
