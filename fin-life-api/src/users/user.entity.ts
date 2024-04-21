import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { ExpenseCategory } from '../expenseCategories/expenseCategory.entity';
import { Expense } from 'src/expenses/expense.entity';
import { Revenue } from '../revenues/revenue.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 128, unique: true })
  email: string;

  @Column({ length: 60 })
  @Exclude()
  password: string;

  @OneToMany(() => ExpenseCategory, (expenseCategory) => expenseCategory.user)
  expenseCategories?: ExpenseCategory[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses?: Expense[];

  @OneToMany(() => Revenue, (revenue) => revenue.user)
  revenues?: Revenue[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolios?: Portfolio[];

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
