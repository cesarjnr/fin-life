import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { ExpenseCategory } from '../expenseCategories/expenseCategory.entity';
import { CashFlow } from 'src/cashFlow/cashFlow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => ExpenseCategory, (expenseCategory) => expenseCategory.user)
  expenseCategories?: ExpenseCategory[];

  @OneToMany(() => CashFlow, (cashFlow) => cashFlow.user)
  cashFlows?: CashFlow[];

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
