import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SplitHistoricalEvent } from './splitHistoricalEvent.entity';
import { EntityManager, Repository } from 'typeorm';
import { DateHelper } from '../common/helpers/date.helper';
import { Asset } from '../assets/asset.entity';
import { AssetSplit } from '../assetDataProvider/assetDataProvider.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

@Injectable()
export class SplitHistoricalEventsService {
  constructor(
    @InjectRepository(SplitHistoricalEvent)
    private readonly splitHistoricalEventsRepository: Repository<SplitHistoricalEvent>,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(asset: Asset, assetSplits: AssetSplit[], manager?: EntityManager): Promise<void> {
    const assetSplitHistoricalEvents = assetSplits.map((assetSplit) => {
      return new SplitHistoricalEvent(
        asset.id,
        this.dateHelper.format(new Date(assetSplit.date * 1000), 'yyyy-MM-dd'),
        assetSplit.numerator,
        assetSplit.denominator,
        assetSplit.ratio
      );
    });

    if (manager) {
      await manager.save(assetSplitHistoricalEvents);
    } else {
      await this.splitHistoricalEventsRepository.save(assetSplitHistoricalEvents);
    }
  }

  public async get(assetId: number, params?: PaginationParams): Promise<PaginationResponse<SplitHistoricalEvent>> {
    const page = Number(params?.page || 0);
    const limit = Number(params?.limit || 10);
    const builder = this.splitHistoricalEventsRepository
      .createQueryBuilder()
      .where({ assetId })
      .skip(page * limit)
      .take(limit);
    const splitHistoricalEvents = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: splitHistoricalEvents,
      itemsPerPage: limit,
      page,
      total
    };
  }
}
