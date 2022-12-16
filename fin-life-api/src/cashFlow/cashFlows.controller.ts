import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CashFlowsService } from './cashFlows.service';
import { CreateCashFlowDto } from './cashFlows.dto';
import { CashFlow } from './cashFlow.entity';

@Controller('users/:userId/cash-flows')
export class CashFlowsController {
  constructor(private readonly cashFlowsService: CashFlowsService) {}

  @Post()
  public async create(
    @Param('userId') userId: string,
    @Body() createCashFlowDto: CreateCashFlowDto
  ): Promise<CashFlow> {
    return await this.cashFlowsService.create(Number(userId), createCashFlowDto);
  }

  @Get()
  public async get(@Param('userId') userId: string): Promise<CashFlow[]> {
    return await this.cashFlowsService.get({ userId: Number(userId) });
  }
}
