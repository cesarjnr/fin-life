import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetRequestParams, GetRequestResponse } from '../common/dto/request';
import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { DateHelper } from '../common/helpers/date.helper';
import { CreateMarketIndexHistoricalDataDto, MarketIndexOverview } from './marketIndexHistoricalData.dto';

export type GetMarketIndexHistoricalDataParams = {
  ticker?: string;
} & GetRequestParams;

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
          data.close / 100
        )
    );

    await this.marketIndexHistoricalDataRepository.save(marketIndexHistoricalData);
  }

  public async get(params: GetMarketIndexHistoricalDataParams): Promise<GetRequestResponse<MarketIndexHistoricalData>> {
    let currentPage = 1;
    let currentPageSize: number;
    const { limit, orderBy, orderByColumn, page, ticker } = params;
    const builder = this.marketIndexHistoricalDataRepository.createQueryBuilder();

    if (ticker) {
      builder.where({ ticker });
    }

    if (orderBy && orderByColumn) {
      builder.orderBy({ [orderByColumn]: orderBy });
    }

    if (limit !== undefined && page !== undefined) {
      currentPage = Number(page) + 1;
      currentPageSize = Number(limit);

      const skipAmount = (currentPage - 1) * currentPageSize;

      builder.skip(skipAmount).take(currentPageSize);
    }

    const marketIndexHistoricalData = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: marketIndexHistoricalData,
      itemsPerPage: currentPageSize || total,
      page: page ? currentPage - 1 : 1,
      total
    };
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
