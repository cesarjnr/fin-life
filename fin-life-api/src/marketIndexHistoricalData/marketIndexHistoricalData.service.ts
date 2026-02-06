import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { GetRequestResponse, OrderBy } from '../common/dto/request';
import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { IndexData, MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { DateHelper } from '../common/helpers/date.helper';
import { GetMarketIndexHistoricalDataDto } from './marketIndexHistoricalData.dto';
import { MarketIndex, MarketIndexTypes } from '../marketIndexes/marketIndex.entity';

@Injectable()
export class MarketIndexHistoricalDataService {
  constructor(
    @InjectRepository(MarketIndexHistoricalData)
    private readonly marketIndexHistoricalDataRepository: Repository<MarketIndexHistoricalData>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly dateHelper: DateHelper
  ) {}

  public async syncData(marketIndex: MarketIndex, manager?: EntityManager): Promise<MarketIndexHistoricalData[]> {
    const [latestMarketIndexData] = await this.getMostRecent([marketIndex.id]);
    const marketIndexData = await this.marketDataProviderService.getIndexHistoricalData(
      marketIndex.code,
      marketIndex.type,
      this.dateHelper.incrementDays(new Date(latestMarketIndexData.date), 1)
    );
    const filteredData = marketIndexData.filter((indexData) => {
      const latestMarketIndexDate = new Date(latestMarketIndexData.date);

      latestMarketIndexDate.setUTCHours(0, 0, 0, 0);

      console.log({ latestMarketIndexData, indexData });

      return indexData.date > latestMarketIndexDate.getTime();
    });

    return await this.create(marketIndex, filteredData, manager);
  }

  public async create(
    marketIndex: MarketIndex,
    indexData: IndexData[],
    manager?: EntityManager
  ): Promise<MarketIndexHistoricalData[]> {
    const marketIndexHistoricalData = indexData.map(
      (data) =>
        new MarketIndexHistoricalData(
          marketIndex.id,
          this.dateHelper.format(new Date(data.date), 'yyyy-MM-dd'),
          marketIndex.type === MarketIndexTypes.Currency ? data.close : data.close / 100
        )
    );

    if (manager) {
      await manager.save(marketIndexHistoricalData);
    } else {
      await this.marketIndexHistoricalDataRepository.save(marketIndexHistoricalData);
    }

    return marketIndexHistoricalData;
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
    const orderByColumn = `marketIndexHistoricalData.${getMarketIndexHistoricalDataDto.orderByColumn ?? 'marketIndexId'}`;
    const orderBy = getMarketIndexHistoricalDataDto.orderBy ?? OrderBy.Asc;
    const builder = this.marketIndexHistoricalDataRepository
      .createQueryBuilder('marketIndexHistoricalData')
      .where({ marketIndexId: getMarketIndexHistoricalDataDto.marketIndexId })
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

  public async getMostRecent(marketIndexIds: number[], date?: string): Promise<MarketIndexHistoricalData[]> {
    const builder = this.marketIndexHistoricalDataRepository
      .createQueryBuilder('marketIndexHistoricalData')
      .distinctOn(['marketIndexHistoricalData.marketIndexId'])
      .orderBy({
        'marketIndexHistoricalData.marketIndexId': 'DESC',
        'marketIndexHistoricalData.date': 'DESC'
      })
      .where({ marketIndexId: In(marketIndexIds) });

    if (date) {
      builder.andWhere({ date });
    }

    return await builder.getMany();
  }
}
