import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { GetRequestResponse, OrderBy } from '../common/dto/request';
import { MarketIndexHistoricalData, MarketIndexTypes } from './marketIndexHistoricalData.entity';
import { IndexData, MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { DateHelper } from '../common/helpers/date.helper';
import {
  CreateMarketIndexHistoricalDataDto,
  GetMarketIndexHistoricalDataDto,
  MarketIndexOverview
} from './marketIndexHistoricalData.dto';
import { DateIntervals } from 'src/common/enums/date';

@Injectable()
export class MarketIndexHistoricalDataService {
  constructor(
    @InjectRepository(MarketIndexHistoricalData)
    private readonly marketIndexHistoricalDataRepository: Repository<MarketIndexHistoricalData>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(createMarketIndexHistoricalDataDto: CreateMarketIndexHistoricalDataDto): Promise<void> {
    const { code, interval, type } = createMarketIndexHistoricalDataDto;
    const data = await this.marketDataProviderService.getIndexHistoricalData(code, type);
    const marketIndexHistoricalData = this.createMarketIndexHistoricalDataInstances(code, interval, type, data);

    await this.marketIndexHistoricalDataRepository.save(marketIndexHistoricalData);
  }

  public async get(
    getMarketIndexHistoricalDataDto: GetMarketIndexHistoricalDataDto
  ): Promise<GetRequestResponse<MarketIndexHistoricalData>> {
    const page: number | null = getMarketIndexHistoricalDataDto?.page
      ? Number(getMarketIndexHistoricalDataDto.page)
      : null;
    const limit: number | null =
      getMarketIndexHistoricalDataDto?.limit && getMarketIndexHistoricalDataDto.limit !== '0'
        ? Number(getMarketIndexHistoricalDataDto.limit)
        : null;
    const orderByColumn = `marketIndexHistoricalData.${getMarketIndexHistoricalDataDto.orderByColumn ?? 'code'}`;
    const orderBy = getMarketIndexHistoricalDataDto.orderBy ?? OrderBy.Asc;
    const builder = this.marketIndexHistoricalDataRepository
      .createQueryBuilder('marketIndexHistoricalData')
      .where({ code: getMarketIndexHistoricalDataDto.code })
      .orderBy(orderByColumn, orderBy);

    if (getMarketIndexHistoricalDataDto.from) {
      builder.andWhere({ date: MoreThanOrEqual(getMarketIndexHistoricalDataDto.from) });
    }

    if (getMarketIndexHistoricalDataDto.to) {
      builder.andWhere({ date: LessThanOrEqual(getMarketIndexHistoricalDataDto.to) });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const marketIndexHistoricalData = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: marketIndexHistoricalData,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async getMarketIndexesOverview(): Promise<MarketIndexOverview[]> {
    const marketIndexHistoricalData = await this.marketIndexHistoricalDataRepository
      .createQueryBuilder('marketIndexHistoricalData')
      .select('MIN(marketIndexHistoricalData.id)', 'id')
      .addSelect('marketIndexHistoricalData.code', 'code')
      .addSelect('marketIndexHistoricalData.type', 'type')
      .addSelect('marketIndexHistoricalData.interval', 'interval')
      .groupBy('code')
      .addGroupBy('type')
      .addGroupBy('interval')
      .orderBy('id')
      .getRawMany();

    return marketIndexHistoricalData.map((marketIndexHistoricalData) => ({
      interval: marketIndexHistoricalData.interval,
      code: marketIndexHistoricalData.code,
      type: marketIndexHistoricalData.type
    }));
  }

  public async syncData(code: string): Promise<MarketIndexHistoricalData[]> {
    const lastMarketIndexHistoricalData = await this.findMostRecent(code, new Date().toISOString());

    if (!lastMarketIndexHistoricalData) {
      throw new NotFoundException('Index not found');
    }

    const data = await this.marketDataProviderService.getIndexHistoricalData(
      code,
      lastMarketIndexHistoricalData.type,
      this.dateHelper.incrementDays(new Date(lastMarketIndexHistoricalData.date), 2)
    );
    const marketIndexHistoricalData = this.createMarketIndexHistoricalDataInstances(
      lastMarketIndexHistoricalData.code,
      lastMarketIndexHistoricalData.interval,
      lastMarketIndexHistoricalData.type,
      data
    );

    await this.marketIndexHistoricalDataRepository.save(marketIndexHistoricalData);

    return marketIndexHistoricalData;
  }

  public findMostRecent(code: string, date?: string): Promise<MarketIndexHistoricalData> {
    const builder = this.marketIndexHistoricalDataRepository.createQueryBuilder('marketIndexData').where({ code });

    if (date) {
      builder.where({ date: LessThanOrEqual(date) });
    }

    return builder.orderBy('date', 'DESC').limit(1).getOne();
  }

  private createMarketIndexHistoricalDataInstances(
    code: string,
    interval: DateIntervals,
    type: MarketIndexTypes,
    data: IndexData[]
  ): MarketIndexHistoricalData[] {
    return data.map(
      (data) =>
        new MarketIndexHistoricalData(
          this.dateHelper.format(new Date(data.date), 'yyyy-MM-dd'),
          code.toUpperCase(),
          interval,
          type,
          type === MarketIndexTypes.Currency ? data.close : data.close / 100
        )
    );
  }
}
