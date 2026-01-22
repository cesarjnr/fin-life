import { Injectable } from '@nestjs/common';

import { OrderBy } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { Operation } from '../operations/operation.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

@Injectable()
export class OperationsFxRatesService {
  constructor(
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly dateHelper: DateHelper
  ) {}

  // public async getFxRates(portfolioAssets: PortfolioAsset[]): Promise<MarketIndexHistoricalData[]> {
  //   const foreignOperations: Operation[] = [];

  //   portfolioAssets.forEach((portfolioAsset) => {
  //     if (portfolioAsset.asset.currency === Currencies.USD) {
  //       portfolioAsset.operations.forEach((operation) => {
  //         foreignOperations.push(operation);
  //       });
  //     }
  //   });

  //   if (!foreignOperations.length) {
  //     return [];
  //   }

  //   const sortedForeignOperations = foreignOperations.sort(
  //     (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  //   );
  //   const firstForeignOperation = sortedForeignOperations[0];
  //   const firstForeignOperationDate = new Date(`${firstForeignOperation.date}T00:00:00.000`);
  //   const result = await this.marketIndexHistoricalDataService.get({
  //     code: 'USD/BRL',
  //     from: this.dateHelper.format(this.dateHelper.startOfMonth(firstForeignOperationDate), 'yyyy-MM-dd'),
  //     orderByColumn: 'date',
  //     orderBy: OrderBy.Desc
  //   });

  //   return result.data;
  // }

  public async calculateWeightedFxRate(operations: Operation[]): Promise<number> {
    if (!operations.length) {
      return 1;
    }

    const sortedOperations = operations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstForeignOperation = sortedOperations[0];
    const firstForeignOperationDate = new Date(`${firstForeignOperation.date}T00:00:00.000`);
    const lastForeignOperation = sortedOperations[sortedOperations.length - 1];
    const lastForeignOperationDate = new Date(`${lastForeignOperation.date}T00:00:00.000`);
    const result = await this.marketIndexHistoricalDataService.get({
      code: 'USD/BRL',
      from: this.dateHelper.format(this.dateHelper.startOfMonth(firstForeignOperationDate), 'yyyy-MM-dd'),
      to: this.dateHelper.format(lastForeignOperationDate, 'yyyy-MM-dd'),
      orderByColumn: 'date',
      orderBy: OrderBy.Desc
    });
    let numerator = 0;
    let denominator = 0;

    operations.forEach((operation) => {
      const latestFxRateBeforeOperation = result.data.find(
        (marketIndexHistoricalData) =>
          new Date(marketIndexHistoricalData.date).getTime() < new Date(operation.date).getTime()
      );

      numerator += operation.total * latestFxRateBeforeOperation.value;
      denominator += operation.total;
    });

    return numerator / denominator;
  }
}
