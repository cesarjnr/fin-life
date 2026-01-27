import { Injectable } from '@nestjs/common';

import { OrderBy } from '../common/dto/request';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { Operation } from '../operations/operation.entity';

@Injectable()
export class OperationsFxRatesService {
  constructor(
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly dateHelper: DateHelper
  ) {}

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
