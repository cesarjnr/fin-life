import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PaymentMethod } from './expenses.enum';
import { User } from '../users/user.entity';
import { ExpenseCategory } from '../expenseCategories/expenseCategory.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column()
  value: number;

  @Column({ nullable: true, comment: 'Who is paying the revenue or receiving the expense' })
  counterpart: string;

  @Column({ name: 'expense_category_id' })
  expenseCategoryId: number;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_institution',
    nullable: true,
    comment: 'Institution used to pay the expense or to receive the revenue'
  })
  paymentInstitution: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  date: Date;

  @ManyToOne(() => User, (user) => user.expenses)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => ExpenseCategory, (expenseCategory) => expenseCategory.expenses)
  @JoinColumn({ name: 'expense_category_id' })
  expenseCategory?: ExpenseCategory;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.value = this.value * 100;
  }

  @AfterLoad()
  public convertValueToReais(): void {
    this.value = this.value / 100;
  }

  constructor(
    description: string,
    value: number,
    counterpart: string,
    paymentMethod: PaymentMethod,
    paymentInstitution: string,
    date: Date,
    userId: number,
    expenseCategoryId: number
  ) {
    this.description = description;
    this.value = value;
    this.counterpart = counterpart;
    this.paymentMethod = paymentMethod;
    this.paymentInstitution = paymentInstitution;
    this.date = date;
    this.userId = userId;
    this.expenseCategoryId = expenseCategoryId;
  }
}
