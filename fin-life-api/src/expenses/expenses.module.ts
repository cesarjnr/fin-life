import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExpensesController } from './expenses.controller';
import { Expense } from './expense.entity';
import { UsersModule } from '../users/users.module';
import { ExpenseCategoriesModule } from '../expenseCategories/expenseCategories.module';
import { ExpensesService } from './expenses.service';

@Module({
  controllers: [ExpensesController],
  imports: [TypeOrmModule.forFeature([Expense]), UsersModule, ExpenseCategoriesModule],
  providers: [ExpensesService]
})
export class ExpensesModule {}
