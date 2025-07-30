import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { GetRequestResponse, OrderBy } from '../common/dto/request';
import { MarketIndexHistoricalData, MarketIndexTypes } from './marketIndexHistoricalData.entity';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { DateHelper } from '../common/helpers/date.helper';
import {
  CreateMarketIndexHistoricalDataDto,
  GetMarketIndexHistoricalDataDto,
  MarketIndexOverview
} from './marketIndexHistoricalData.dto';

@Injectable()
export class MarketIndexHistoricalDataService {
  constructor(
    @InjectRepository(MarketIndexHistoricalData)
    private readonly marketIndexHistoricalDataRepository: Repository<MarketIndexHistoricalData>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(createMarketIndexHistoricalDataDto: CreateMarketIndexHistoricalDataDto): Promise<void> {
    const { ticker, interval, type } = createMarketIndexHistoricalDataDto;
    const data = await this.marketDataProviderService.getIndexHistoricalData(ticker, type);
    const marketIndexHistoricalData = data.map(
      (data) =>
        new MarketIndexHistoricalData(
          this.dateHelper.format(new Date(data.date), 'yyyy-MM-dd'),
          ticker.toUpperCase(),
          interval,
          type,
          type === MarketIndexTypes.Currency ? data.close : data.close / 100
        )
    );

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
    const orderByColumn = `marketIndexHistoricalData.${getMarketIndexHistoricalDataDto.orderByColumn ?? 'ticker'}`;
    const orderBy = getMarketIndexHistoricalDataDto.orderBy ?? OrderBy.Asc;
    const builder = this.marketIndexHistoricalDataRepository
      .createQueryBuilder('marketIndexHistoricalData')
      .where({ ticker: getMarketIndexHistoricalDataDto.ticker })
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

  public findMostRecent(ticker: string, date?: string): Promise<MarketIndexHistoricalData> {
    const builder = this.marketIndexHistoricalDataRepository.createQueryBuilder('marketIndexData').where({ ticker });

    if (date) {
      builder.where({ date: LessThanOrEqual(date) });
    }

    return builder.orderBy('date', 'DESC').limit(1).getOne();
  }

  public async getMarketIndexesOverview(): Promise<MarketIndexOverview[]> {
    const marketIndexHistoricalData = await this.marketIndexHistoricalDataRepository
      .createQueryBuilder('marketIndexHistoricalData')
      .select('MIN(marketIndexHistoricalData.id)', 'id')
      .addSelect('marketIndexHistoricalData.ticker', 'ticker')
      .addSelect('marketIndexHistoricalData.type', 'type')
      .addSelect('marketIndexHistoricalData.interval', 'interval')
      .groupBy('ticker')
      .addGroupBy('type')
      .addGroupBy('interval')
      .orderBy('id')
      .getRawMany();

    return marketIndexHistoricalData.map((marketIndexHistoricalData) => ({
      interval: marketIndexHistoricalData.interval,
      ticker: marketIndexHistoricalData.ticker,
      type: marketIndexHistoricalData.type
    }));
  }
}
