import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { RevenuesService } from './revenues.service';
import { CreateRevenueDto, UpdateRevenueDto } from './revenues.dto';
import { Revenue } from './revenue.entity';

@Controller('users/:userId/revenues')
export class RevenuesController {
  constructor(private readonly revenuesService: RevenuesService) {}

  @Post()
  public async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createRevenueDto: CreateRevenueDto
  ): Promise<Revenue> {
    return await this.revenuesService.create(userId, createRevenueDto);
  }

  @Get()
  public async get(@Param('userId', ParseIntPipe) userId: number): Promise<Revenue[]> {
    return await this.revenuesService.get({ userId });
  }

  @Patch(':revenueId')
  public async update(
    @Param('revenueId', ParseIntPipe) revenueId: number,
    @Body() updateRevenueDto: UpdateRevenueDto
  ): Promise<Revenue> {
    return await this.revenuesService.update(revenueId, updateRevenueDto);
  }
}
