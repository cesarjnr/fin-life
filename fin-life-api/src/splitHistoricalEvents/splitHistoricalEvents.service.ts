import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SplitHistoricalEvent } from './splitHistoricalEvent.entity';
import { EntityManager, Repository } from 'typeorm';
import { DateHelper } from '../common/helpers/date.helper';
import { Asset } from '../assets/asset.entity';
import { AssetSplit } from '../marketDataProvider/marketDataProvider.service';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

export type GetSplitHistoricalEventsDto = PaginationParams & { relations?: string[] };

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

  public async get(
    assetId: number,
    getSplitHistoricalEventsDto?: GetSplitHistoricalEventsDto
  ): Promise<PaginationResponse<SplitHistoricalEvent>> {
    const page = Number(getSplitHistoricalEventsDto?.page || 0);
    const limit =
      getSplitHistoricalEventsDto?.limit && getSplitHistoricalEventsDto.limit !== '0'
        ? Number(getSplitHistoricalEventsDto.limit)
        : 10;
    const builder = this.splitHistoricalEventsRepository
      .createQueryBuilder('splitHistoricalEvent')
      .where({ assetId })
      .skip(page * limit)
      .take(limit);

    if (getSplitHistoricalEventsDto.relations) {
      (Array.isArray(getSplitHistoricalEventsDto.relations)
        ? getSplitHistoricalEventsDto.relations
        : [getSplitHistoricalEventsDto.relations]
      ).forEach((relation) => {
        builder.leftJoinAndSelect(`splitHistoricalEvent.${relation}`, relation.slice(0, relation.length - 1));
      });
    }

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
