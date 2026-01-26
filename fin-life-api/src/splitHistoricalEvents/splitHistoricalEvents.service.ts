import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SplitHistoricalEvent } from './splitHistoricalEvent.entity';
import { EntityManager, Repository } from 'typeorm';
import { DateHelper } from '../common/helpers/date.helper';
import { Asset, AssetClasses } from '../assets/asset.entity';
import { AssetSplit, MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { GetRequestParams, GetRequestResponse } from '../common/dto/request';

export type GetSplitHistoricalEventsDto = GetRequestParams & { relations?: string[] };

@Injectable()
export class SplitHistoricalEventsService {
  constructor(
    @InjectRepository(SplitHistoricalEvent)
    private readonly splitHistoricalEventsRepository: Repository<SplitHistoricalEvent>,
    private readonly dateHelper: DateHelper,
    private readonly marketDataProviderService: MarketDataProviderService
  ) {}

  public async syncSplits(asset: Asset): Promise<SplitHistoricalEvent[]> {
    const latestSplit = asset.splitHistoricalEvents[asset.splitHistoricalEvents.length - 1];

    if (!latestSplit) {
      throw new NotFoundException(`No split found for ${asset.code}`);
    }

    const assetFullCode = asset.class !== AssetClasses.International ? `${asset.code}.SA` : asset.code;
    const fromDate = this.dateHelper.addDays(new Date(latestSplit.date), 2);
    const assetData = await this.marketDataProviderService.getAssetHistoricalData(assetFullCode, fromDate, true);
    let newSplitHistoricalEvents: SplitHistoricalEvent[] = [];

    if (assetData.splits.length) {
      newSplitHistoricalEvents = await this.create(asset, assetData.splits);
    }

    return newSplitHistoricalEvents;
  }

  public async create(
    asset: Asset,
    assetSplits: AssetSplit[],
    manager?: EntityManager
  ): Promise<SplitHistoricalEvent[]> {
    const splitHistoricalEvents = assetSplits.map((assetSplit) => {
      return new SplitHistoricalEvent(
        asset.id,
        this.dateHelper.format(new Date(assetSplit.date * 1000), 'yyyy-MM-dd'),
        assetSplit.numerator,
        assetSplit.denominator,
        assetSplit.ratio
      );
    });

    if (manager) {
      await manager.save(splitHistoricalEvents);
    } else {
      await this.splitHistoricalEventsRepository.save(splitHistoricalEvents);
    }

    return splitHistoricalEvents;
  }

  public async get(
    assetId: number,
    getSplitHistoricalEventsDto?: GetSplitHistoricalEventsDto
  ): Promise<GetRequestResponse<SplitHistoricalEvent>> {
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
