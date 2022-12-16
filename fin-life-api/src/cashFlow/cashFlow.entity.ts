import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CashFlowType, PaymentMethod } from './cashFlows.enum';
import { User } from '../users/user.entity';
import { ExpenseCategory } from '../expenseCategories/expenseCategory.entity';

@Entity('cash_flows')
export class CashFlow {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  description: string;

  @Column()
  value: number;

  @Column()
  type: CashFlowType;

  @Column({ nullable: true, comment: 'Who is paying the revenue or receiving the expense' })
  counterpart: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_institution',
    nullable: true,
    comment: 'Institution used to pay the expense or to receive the revenue'
  })
  paymentInstitution: string;

  @Column()
  date: Date;

  @ManyToOne(() => User, (user) => user.cashFlows)
  @JoinColumn({ name: 'user_id' })
  user: User | number;

  @ManyToOne(() => ExpenseCategory, (expenseCategory) => expenseCategory.cashFlows)
  @JoinColumn({ name: 'expense_category_id' })
  expenseCategory: ExpenseCategory | number;

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
    type: CashFlowType,
    counterpart: string,
    paymentMethod: PaymentMethod,
    paymentInstitution: string,
    date: Date,
    user: User | number,
    expenseCategory: ExpenseCategory | number
  ) {
    this.description = description;
    this.value = value;
    this.type = type;
    this.counterpart = counterpart;
    this.paymentMethod = paymentMethod;
    this.paymentInstitution = paymentInstitution;
    this.date = date;
    this.user = user;
    this.expenseCategory = expenseCategory;
  }
}
