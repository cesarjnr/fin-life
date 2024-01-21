import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { Asset } from '../assets/asset.entity';
import { AssetDividend } from '../assetDataProvider/assetDataProvider.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

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

  public async get(assetId: number, params?: PaginationParams): Promise<PaginationResponse<DividendHistoricalPayment>> {
    const page = Number(params?.page || 0);
    const limit = params?.limit && params.limit !== '0' ? Number(params.limit) : 10;
    const builder = this.dividendHistoricalPaymentsRepository
      .createQueryBuilder()
      .where({ assetId })
      .skip(page * limit)
      .take(limit);
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
