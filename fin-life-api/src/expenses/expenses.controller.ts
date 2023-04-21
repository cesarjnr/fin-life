import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expenses.dto';
import { Expense } from './expense.entity';

@Controller('users/:userId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  public async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createExpenseDto: CreateExpenseDto
  ): Promise<Expense> {
    return await this.expensesService.create(Number(userId), createExpenseDto);
  }

  @Get()
  public async get(@Param('userId', ParseIntPipe) userId: number): Promise<Expense[]> {
    return await this.expensesService.get({ userId: userId });
  }

  @Patch(':expenseId')
  public async update(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() updateExpenseDto: UpdateExpenseDto
  ): Promise<Expense> {
    return await this.expensesService.update(expenseId, updateExpenseDto);
  }
}
