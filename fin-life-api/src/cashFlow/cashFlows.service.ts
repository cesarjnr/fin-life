import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CashFlow } from './cashFlow.entity';
import { UsersService } from '../users/users.service';
import { ExpenseCategoriesService } from '../expenseCategories/expenseCategories.service';
import { CreateCashFlowDto } from './cashFlows.dto';

export interface CashFlowsSearchParams {
  userId?: number;
}

@Injectable()
export class CashFlowsService {
  constructor(
    @InjectRepository(CashFlow) private readonly cashFlowsRepository: Repository<CashFlow>,
    private readonly usersService: UsersService,
    private readonly expenseCategoriesService: ExpenseCategoriesService
  ) {}

  public async create(userId: number, createCashFlowDto: CreateCashFlowDto): Promise<CashFlow> {
    const { description, value, type, counterpart, paymentMethod, paymentInstitution, date, expenseCategoryId } =
      createCashFlowDto;
    const user = await this.usersService.findUser(userId);
    const expenseCategory = this.expenseCategoriesService.findExpenseCategory(user, expenseCategoryId);
    const cashFlow = new CashFlow(
      description,
      value,
      type,
      counterpart,
      paymentMethod,
      paymentInstitution,
      new Date(date),
      user,
      expenseCategory
    );

    await this.cashFlowsRepository.save(cashFlow);
    cashFlow.convertValueToReais();

    return cashFlow;
  }

  public async get(params?: CashFlowsSearchParams): Promise<CashFlow[]> {
    return await this.cashFlowsRepository.find({ user: params.userId });
  }
}
