import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { DateHelper } from '../common/helpers/date.helper';
import { CreateMarketIndexHistoricalDataDto } from './marketIndexHistoricalData.dto';

interface GetMarketIndexHistoricalDataParams {
  ticker: string;
  order?: {
    date: 'ASC' | 'DESC';
  };
}

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
          data.close
        )
    );

    await this.marketIndexHistoricalDataRepository.save(marketIndexHistoricalData);
  }

  public async get(params: GetMarketIndexHistoricalDataParams): Promise<MarketIndexHistoricalData[]> {
    const { order, ticker } = params;
    const data = await this.marketIndexHistoricalDataRepository.find({
      where: { ticker: ticker.toUpperCase() },
      order
    });

    return data;
  }
}
