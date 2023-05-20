import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Expense } from './expense.entity';
import { UsersService } from '../users/users.service';
import { ExpenseCategoriesService } from '../expenseCategories/expenseCategories.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expenses.dto';

export interface ExpensesSearchParams {
  userId?: number;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private readonly expensesRepository: Repository<Expense>,
    private readonly usersService: UsersService,
    private readonly expenseCategoriesService: ExpenseCategoriesService
  ) {}

  public async create(userId: number, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const user = await this.usersService.findUser(userId);
    const { description, value, counterpart, paymentMethod, paymentInstitution, date, expenseCategoryId } =
      createExpenseDto;
    const expenseCategory = this.expenseCategoriesService.findExpenseCategory(user, expenseCategoryId);
    const expense = new Expense(
      description,
      value,
      counterpart,
      paymentMethod,
      paymentInstitution,
      new Date(date),
      user.id,
      expenseCategory.id
    );

    await this.expensesRepository.save(expense);
    expense.convertValueToReais();

    return expense;
  }

  public async get(params?: ExpensesSearchParams): Promise<Expense[]> {
    return await this.expensesRepository.find({ userId: params.userId });
  }

  public async update(expenseId: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findExpense(expenseId);

    Object.assign(expense, updateExpenseDto);
    await this.expensesRepository.save(expense);

    return expense;
  }

  private async findExpense(expenseId: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ id: expenseId });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }
}
