import { Controller, Post, Body, Param, Get, Patch } from '@nestjs/common';

import {
  ExpenseCategoriesService,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto
} from './expenseCategories.service';
import { ExpenseCategory } from './expenseCategory.entity';

@Controller('users/:userId/expense-categories')
export class ExpenseCategoriesController {
  constructor(private expenseCategoriesService: ExpenseCategoriesService) {}

  @Post()
  public async create(
    @Param('userId') userId: string,
    @Body() createExpenseCategoryDto: Omit<CreateExpenseCategoryDto, 'userId'>
  ): Promise<ExpenseCategory> {
    return await this.expenseCategoriesService.create(
      Object.assign({}, createExpenseCategoryDto, { userId: Number(userId) })
    );
  }

  @Get()
  public async get(@Param('userId') userId: string): Promise<ExpenseCategory[]> {
    return await this.expenseCategoriesService.get({ userId: Number(userId) });
  }

  @Patch(':expenseCategoryId')
  public async update(
    @Param('userId') userId: string,
    @Param('expenseCategoryId') expenseCategoryId: string,
    @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    return await this.expenseCategoriesService.update(
      Number(userId),
      Number(expenseCategoryId),
      updateExpenseCategoryDto
    );
  }
}
