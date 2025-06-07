import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { Asset } from '../assets/asset.entity';
import { AssetDividend } from '../marketDataProvider/marketDataProvider.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

export type GetDividendHistoricalPaymentsDto = PaginationParams & { relations?: string[] };

@Injectable()
export class DividendHistoricalPaymentsService {
  constructor(
    @InjectRepository(DividendHistoricalPayment)
    private readonly dividendHistoricalPaymentsRepository: Repository<DividendHistoricalPayment>,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(asset: Asset, assetDividends: AssetDividend[], manager?: EntityManager): Promise<void> {
    const assetDividendHistoricalPayments = assetDividends.map((assetDividend) => {
      return new DividendHistoricalPayment(
        asset.id,
        this.dateHelper.format(new Date(assetDividend.date * 1000), 'yyyy-MM-dd'),
        assetDividend.amount
      );
    });

    if (manager) {
      await manager.save(assetDividendHistoricalPayments);
    } else {
      await this.dividendHistoricalPaymentsRepository.save(assetDividendHistoricalPayments);
    }
  }

  public async get(
    assetId: number,
    getDividendHistoricalPaymentsDto?: GetDividendHistoricalPaymentsDto
  ): Promise<PaginationResponse<DividendHistoricalPayment>> {
    const page = Number(getDividendHistoricalPaymentsDto?.page || 0);
    const limit =
      getDividendHistoricalPaymentsDto?.limit && getDividendHistoricalPaymentsDto.limit !== '0'
        ? Number(getDividendHistoricalPaymentsDto.limit)
        : 10;
    const builder = this.dividendHistoricalPaymentsRepository
      .createQueryBuilder('dividendHistoricalPayment')
      .where({ assetId })
      .skip(page * limit)
      .take(limit);

    if (getDividendHistoricalPaymentsDto.relations) {
      (Array.isArray(getDividendHistoricalPaymentsDto.relations)
        ? getDividendHistoricalPaymentsDto.relations
        : [getDividendHistoricalPaymentsDto.relations]
      ).forEach((relation) => {
        builder.leftJoinAndSelect(`dividendHistoricalPayment.${relation}`, relation.slice(0, relation.length - 1));
      });
    }

    const dividendHistoricalPayments = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: dividendHistoricalPayments,
      itemsPerPage: limit,
      page,
      total
    };
  }
}
