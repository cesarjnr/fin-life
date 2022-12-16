import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashFlowsController } from './cashFlows.controller';
import { CashFlow } from './cashFlow.entity';
import { UsersModule } from '../users/users.module';
import { ExpenseCategoriesModule } from '../expenseCategories/expenseCategories.module';
import { CashFlowsService } from './cashFlows.service';

@Module({
  controllers: [CashFlowsController],
  imports: [TypeOrmModule.forFeature([CashFlow]), UsersModule, ExpenseCategoriesModule],
  providers: [CashFlowsService]
})
export class CashFlowsModule {}
