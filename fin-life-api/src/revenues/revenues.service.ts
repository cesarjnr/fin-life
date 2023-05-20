import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Revenue } from './revenue.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateRevenueDto, UpdateRevenueDto } from './revenues.dto';

export interface RevenuesSearchParams {
  userId?: number;
}

@Injectable()
export class RevenuesService {
  constructor(
    @InjectRepository(Revenue) private readonly revenuesRepository: Repository<Revenue>,
    private readonly usersService: UsersService
  ) {}

  public async create(userId: number, createRevenueDto: CreateRevenueDto): Promise<Revenue> {
    const user = await this.usersService.findUser(userId);
    const { date, description, destinyInstitution, source, value } = createRevenueDto;
    const revenue = new Revenue(new Date(date), description, destinyInstitution, source, value, user.id);

    await this.revenuesRepository.save(revenue);
    revenue.convertValueToReais();

    return revenue;
  }

  public async get(params?: RevenuesSearchParams): Promise<Revenue[]> {
    return await this.revenuesRepository.find({ userId: params.userId });
  }

  public async update(revenueId: number, updateRevenueDto: UpdateRevenueDto): Promise<Revenue> {
    const revenue = await this.findRevenue(revenueId);

    Object.assign(revenue, updateRevenueDto);
    await this.revenuesRepository.save(revenue);

    return revenue;
  }

  private async findRevenue(revenueId: number): Promise<Revenue> {
    const revenue = await this.revenuesRepository.findOne({ id: revenueId });

    if (!revenue) {
      throw new NotFoundException('Revenue not found');
    }

    return revenue;
  }
}
