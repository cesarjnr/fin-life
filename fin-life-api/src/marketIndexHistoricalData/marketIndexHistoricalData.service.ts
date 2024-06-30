import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MarketIndexHistoricalData } from './marketIndexHistoricalData.entity';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { DateHelper } from '../common/helpers/date.helper';
import { CreateMarketIndexHistoricalDataDto } from './marketIndexHistoricalData.dto';

@Injectable()
export class MarketIndexHistoricalDataService {
  constructor(
    @InjectRepository(MarketIndexHistoricalData)
    private readonly marketIndexHistoricalDataRepository: Repository<MarketIndexHistoricalData>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(createMarketIndexHistoricalDataDto: CreateMarketIndexHistoricalDataDto): Promise<void> {
    const { ticker, type } = createMarketIndexHistoricalDataDto;
    const data = await this.marketDataProviderService.getIndexHistoricalData(ticker, type);
    const marketIndexHistoricalData = data.map(
      (data) =>
        new MarketIndexHistoricalData(
          this.dateHelper.format(new Date(data.date), 'yyyy-MM-dd'),
          ticker.toUpperCase(),
          type,
          data.close
        )
    );

    await this.marketIndexHistoricalDataRepository.save(marketIndexHistoricalData);
  }

  public async get(ticker: string): Promise<MarketIndexHistoricalData[]> {
    const data = await this.marketIndexHistoricalDataRepository.find({ where: { ticker: ticker.toUpperCase() } });

    return data;
  }
}
