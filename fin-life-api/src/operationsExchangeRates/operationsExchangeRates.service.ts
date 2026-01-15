import { Injectable } from '@nestjs/common';

import { OrderBy } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { Operation } from '../operations/operation.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

@Injectable()
export class OperationsExchangeRatesService {
  constructor(
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly dateHelper: DateHelper
  ) {}

  public async getUsdBrlExchangeRates(portfolioAssets: PortfolioAsset[]): Promise<MarketIndexHistoricalData[]> {
    const foreignOperations: Operation[] = [];

    portfolioAssets.forEach((portfolioAsset) => {
      if (portfolioAsset.asset.currency === Currencies.USD) {
        portfolioAsset.operations.forEach((operation) => {
          foreignOperations.push(operation);
        });
      }
    });

    if (!foreignOperations.length) {
      return [];
    }

    const sortedForeignOperations = foreignOperations.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstForeignOperation = sortedForeignOperations[0];
    const firstForeignOperationDate = new Date(`${firstForeignOperation.date}T00:00:00.000`);
    const result = await this.marketIndexHistoricalDataService.get({
      ticker: 'USD/BRL',
      from: this.dateHelper.format(this.dateHelper.startOfMonth(firstForeignOperationDate), 'yyyy-MM-dd'),
      orderByColumn: 'date',
      orderBy: OrderBy.Desc
    });

    return result.data;
  }
}
