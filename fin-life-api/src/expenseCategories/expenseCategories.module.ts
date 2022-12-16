import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExpenseCategoriesController } from './expenseCategories.controller';
import { ExpenseCategory } from './expenseCategory.entity';
import { UsersModule } from '../users/users.module';
import { ExpenseCategoriesService } from './expenseCategories.service';

@Module({
  controllers: [ExpenseCategoriesController],
  exports: [ExpenseCategoriesService],
  imports: [TypeOrmModule.forFeature([ExpenseCategory]), UsersModule],
  providers: [ExpenseCategoriesService]
})
export class ExpenseCategoriesModule {}
