import { Injectable, Logger } from '@nestjs/common';

import { OrderBy } from '../common/dto/request';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { Operation } from '../operations/operation.entity';
import { MarketIndexesService } from '../marketIndexes/marketIndexes.service';

@Injectable()
export class OperationsFxRatesService {
  private readonly logger = new Logger(OperationsFxRatesService.name);

  constructor(
    private readonly marketIndexesService: MarketIndexesService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly dateHelper: DateHelper
  ) {}

  /**
   * Weights the USD/BRL rate by each operation's `total`, using the rate on the day before each
   * operation's date. Callers should pass only the operations relevant to what they're converting
   * (e.g. only sells when converting realized sale proceeds) — this does not filter by type itself.
   */
  public async calculateWeightedFxRate(operations: Operation[]): Promise<number> {
    if (!operations.length) {
      return 1;
    }

    const sortedOperations = [...operations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstOperationDate = new Date(`${sortedOperations[0].date}T00:00:00.000`);
    const lastOperationDate = new Date(`${sortedOperations[sortedOperations.length - 1].date}T00:00:00.000`);
    const marketIndex = await this.marketIndexesService.find({ code: 'USD/BRL' });
    const result = await this.marketIndexHistoricalDataService.get({
      marketIndexId: marketIndex.id,
      from: this.dateHelper.format(this.dateHelper.subtractDays(firstOperationDate, 7), 'yyyy-MM-dd'),
      to: this.dateHelper.format(lastOperationDate, 'yyyy-MM-dd'),
      orderByColumn: 'date',
      orderBy: OrderBy.Desc
    });
    let numerator = 0;
    let denominator = 0;

    sortedOperations.forEach((operation) => {
      const latestFxRateBeforeOperation = result.data.find(
        (marketIndexHistoricalData) =>
          new Date(marketIndexHistoricalData.date).getTime() < new Date(operation.date).getTime()
      );

      if (!latestFxRateBeforeOperation) {
        this.logger.warn(
          `[calculateWeightedFxRate] No USD/BRL rate found before operation dated ${operation.date}; excluding it from the weighted average`
        );

        return;
      }

      numerator += operation.total * latestFxRateBeforeOperation.value;
      denominator += operation.total;
    });

    return denominator ? numerator / denominator : 1;
  }
}
