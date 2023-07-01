import { AfterLoad, BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PaymentMethods } from './expenses.enum';
import { User } from '../users/user.entity';
import { ExpenseCategory } from '../expenseCategories/expenseCategory.entity';

@Index('expenses_user_id_expense_category_id_idx', ['userId', 'expenseCategoryId'])
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

  @Column({ name: 'expense_category_id', nullable: true })
  expenseCategoryId: number;

  @Column({ name: 'payment_method', nullable: true, type: 'enum', enum: PaymentMethods })
  paymentMethod: PaymentMethods;

  @Column({
    name: 'payment_institution',
    nullable: true,
    comment: 'Institution used to pay the expense'
  })
  paymentInstitution: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => User, (user) => user.expenses)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'expenses_user_id_fkey' })
  user?: User;

  @ManyToOne(() => ExpenseCategory, (expenseCategory) => expenseCategory.expenses)
  @JoinColumn({ name: 'expense_category_id', foreignKeyConstraintName: 'expenses_expense_category_id_fkey' })
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
    paymentMethod: PaymentMethods,
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
