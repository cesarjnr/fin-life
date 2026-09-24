import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PayoutsChart, GetPayoutsCharDto, AssetChartData, GetAssetChartDto, ChartPeriod } from './charts.dto';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAssetEvent, PortfolioAssetEventTypes } from '../portfoliosAssetsEvents/portfolioAssetEvent.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { OperationsService } from '../operations/operations.service';
import { Operation } from '../operations/operation.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { AssetsService } from '../assets/assets.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { OrderBy } from '../common/dto/request';

type OperationsGroupedByLabels = Map<string, Operation[]>;

interface PortfolioAssetPayoutQueryRow {
  label: string;
  value: string;
  year?: string;
  month?: string;
  day?: string;
}

@Injectable()
export class ChartsService {
  private readonly logger = new Logger(ChartsService.name);
  private readonly groupByPeriodFormatMap = new Map<string, string>([
    ['day', 'yyyy-MM-DD'],
    ['month', 'yyyy-MM'],
    ['year', 'yyyy']
  ]);
  private readonly chartPeriodGroupByMap = new Map<ChartPeriod, string>([
    [ChartPeriod.SevenDays, 'day'],
    [ChartPeriod.OneMonth, 'day'],
    [ChartPeriod.SixMonths, 'month'],
    [ChartPeriod.OneYear, 'month'],
    [ChartPeriod.YearToDate, 'month'],
    [ChartPeriod.FiveYears, 'year'],
    [ChartPeriod.Max, 'year']
  ]);

  constructor(
    @InjectRepository(PortfolioAssetEvent)
    private readonly portfoliosAssetsEventsRepository: Repository<PortfolioAssetEvent>,
    @InjectRepository(PortfolioAsset)
    private readonly portfoliosAssetsRepository: Repository<PortfolioAsset>,
    private readonly dateHelper: DateHelper,
    private readonly operationsService: OperationsService,
    private readonly assetsService: AssetsService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService
  ) {}

  public async getPayoutsChart(portfolioId: number, getPayoutsChartDto: GetPayoutsCharDto): Promise<PayoutsChart[]> {
    const payoutsChartGroupedByPeriod: PayoutsChart[] = [];
    const groupByPeriod = getPayoutsChartDto.groupByPeriod ?? 'month';
    const groupByAssetProp = getPayoutsChartDto.groupByAssetProp ?? 'code';
    const assets = await this.getPortfolioAssets(
      portfolioId,
      getPayoutsChartDto.assetId ? Number(getPayoutsChartDto.assetId) : undefined
    );

    if (assets.length) {
      const payoutsQueryResult = await this.getPayouts(groupByAssetProp, groupByPeriod, getPayoutsChartDto);
      const groupedOperations = await this.getOperationsGroupedByLabels(
        portfolioId,
        getPayoutsChartDto,
        groupByAssetProp,
        assets
      );

      payoutsQueryResult.forEach((row) => {
        const period = row[groupByPeriod];

        this.addPeriodToPayoutsChartDataGroups(payoutsChartGroupedByPeriod, period);
        this.addDataToPeriodGroups(
          assets,
          groupByAssetProp,
          row,
          payoutsChartGroupedByPeriod,
          groupedOperations,
          period
        );
      });
    }

    return payoutsChartGroupedByPeriod;
  }

  public async getAssetChart(assetId: number, getAssetChartDto: GetAssetChartDto): Promise<AssetChartData[]> {
    this.logger.log('[getAssetChart] Getting asset chart...');

    const assetChartData: AssetChartData[] = [];
    const asset = await this.assetsService.find(assetId);

    if (asset) {
      const period = getAssetChartDto.period || ChartPeriod.OneMonth;
      const fromDate = this.getChartFromDate(period);
      const groupBy = this.chartPeriodGroupByMap.get(period);
      const groupByFormat = this.groupByPeriodFormatMap.get(groupBy);

      const { data: prices } = await this.assetHistoricalPricesService.get({
        assetIds: [asset.id],
        from: fromDate,
        orderByColumn: 'date',
        orderBy: OrderBy.Asc
      });

      this.logger.log(`[getAssetChart] ${prices.length} prices found for period ${period}`);

      if (prices.length) {
        const basePrice = prices[0].closingPrice;

        if (groupBy === 'day') {
          for (const price of prices) {
            assetChartData.push({
              date: price.date,
              value: price.closingPrice,
              yield: ((price.closingPrice - basePrice) / basePrice) * 100
            });
          }
        } else {
          const groupedPrices = new Map<string, AssetHistoricalPrice>();

          for (const price of prices) {
            const groupKey = this.dateHelper.format(new Date(price.date), groupByFormat);

            groupedPrices.set(groupKey, price);
          }

          for (const [groupKey, price] of groupedPrices) {
            assetChartData.push({
              date: groupKey,
              value: price.closingPrice,
              yield: ((price.closingPrice - basePrice) / basePrice) * 100
            });
          }
        }
      }
    }

    return assetChartData;
  }

  private getChartFromDate(period: ChartPeriod): string | undefined {
    const now = new Date();

    switch (period) {
      case ChartPeriod.SevenDays:
        return this.dateHelper.format(this.dateHelper.subtractDays(now, 7), 'yyyy-MM-dd');
      case ChartPeriod.OneMonth:
        return this.dateHelper.format(this.dateHelper.subtractMonths(now, 1), 'yyyy-MM-dd');
      case ChartPeriod.SixMonths:
        return this.dateHelper.format(this.dateHelper.subtractMonths(now, 6), 'yyyy-MM-dd');
      case ChartPeriod.OneYear:
        return this.dateHelper.format(this.dateHelper.subtractYears(now, 1), 'yyyy-MM-dd');
      case ChartPeriod.FiveYears:
        return this.dateHelper.format(this.dateHelper.subtractYears(now, 5), 'yyyy-MM-dd');
      case ChartPeriod.YearToDate:
        return this.dateHelper.format(this.dateHelper.startOfYear(now), 'yyyy-MM-dd');
      case ChartPeriod.Max:
        return undefined;
    }
  }

  private async getPortfolioAssets(portfolioId: number, assetId?: number): Promise<Asset[]> {
    this.logger.log('[getPortfolioAssets] Getting portfolio assets...');

    const portfoliosAssets = await this.portfoliosAssetsRepository.find({
      where: { portfolioId, assetId },
      relations: ['asset.assetHistoricalPrices', 'asset.splitHistoricalEvents'],
      order: {
        asset: {
          assetHistoricalPrices: {
            date: 'DESC'
          }
        }
      }
    });

    this.logger.log(`[getPortfolioAssets] ${portfoliosAssets.length} assets found`);

    return portfoliosAssets.map((portfolioAsset) => portfolioAsset.asset);
  }

  private async getOperationsGroupedByLabels(
    portfolioId: number,
    getPayoutsChartDto: GetPayoutsCharDto,
    label: string,
    assets: Asset[]
  ): Promise<OperationsGroupedByLabels> {
    const operationsGroupedByLabelsMap: OperationsGroupedByLabels = new Map([]);
    const { data: operations } = await this.operationsService.get({
      portfolioId,
      assetId: getPayoutsChartDto.assetId,
      end: getPayoutsChartDto.end
    });
    const adjustedOperations = operations.map((operation) => {
      const operationAsset = assets.find((asset) => asset.id === operation.portfolioAsset.assetId);

      return this.operationsService.adjustOperationBySplitsAndGroupings(operation, operationAsset);
    });

    adjustedOperations.forEach((operation) => {
      const operationAsset = assets.find((asset) => asset.id === operation.portfolioAsset.assetId);
      const correspondingAssetGroup = operationsGroupedByLabelsMap.get(operationAsset[label]);

      if (!correspondingAssetGroup) {
        operationsGroupedByLabelsMap.set(operationAsset[label], [operation]);
      } else {
        correspondingAssetGroup.push(operation);
      }
    });

    return operationsGroupedByLabelsMap;
  }

  private async getPayouts(
    groupByAssetProp: string,
    groupByPeriod: string,
    getPayoutsChartDto: GetPayoutsCharDto
  ): Promise<PortfolioAssetPayoutQueryRow[]> {
    const groupByPeriodFormat = this.groupByPeriodFormatMap.get(groupByPeriod);
    const builder = this.portfoliosAssetsEventsRepository
      .createQueryBuilder('event')
      .select(`asset.${groupByAssetProp}`, 'label')
      .addSelect(`TO_CHAR(event.date, '${groupByPeriodFormat}')`, groupByPeriod)
      .addSelect(
        `
          SUM(
            CASE
              WHEN event.currency = 'USD'
                THEN
                  CASE
                    WHEN event.withdrawal_date_exchange_rate > 0
                      THEN event.withdrawal_date_exchange_rate * event.total
                    WHEN event.received_date_exchange_rate > 0
                      THEN event.received_date_exchange_rate * event.total
                    ELSE
                      0
                  END
              ELSE
                event.total
            END
        )
        `,
        'value'
      )
      .where('event.type != :type', { type: PortfolioAssetEventTypes.Bonus })
      .leftJoin('event.portfolioAsset', 'portfolioAsset')
      .leftJoin('portfolioAsset.asset', 'asset')
      .groupBy(groupByPeriod)
      .addGroupBy('label')
      .orderBy(groupByPeriod, 'ASC');

    if (getPayoutsChartDto.assetId) {
      builder.andWhere('asset.id = :assetId', { assetId: Number(getPayoutsChartDto.assetId) });
    }

    if (getPayoutsChartDto.start) {
      builder.andWhere('event.date >= :start', { start: getPayoutsChartDto.start });
    }

    if (getPayoutsChartDto.end) {
      builder.andWhere('event.date <= :end', { end: getPayoutsChartDto.end });
    }

    return await builder.getRawMany();
  }

  private addPeriodToPayoutsChartDataGroups(payoutsChartGroupedByPeriod: PayoutsChart[], period: string): void {
    let existingPeriodGroup = payoutsChartGroupedByPeriod.find((group) => group.period === period);

    if (!existingPeriodGroup) {
      existingPeriodGroup = {
        period: period,
        data: []
      };

      payoutsChartGroupedByPeriod.push(existingPeriodGroup);
    }
  }

  private addDataToPeriodGroups(
    assets: Asset[],
    groupByAssetProp: string,
    payoutQueryRow: PortfolioAssetPayoutQueryRow,
    payoutsChartGroupedByPeriod: PayoutsChart[],
    groupedByOperations: OperationsGroupedByLabels,
    period: string
  ): void {
    const asset = assets.find((asset) => asset[groupByAssetProp] === payoutQueryRow.label);

    payoutsChartGroupedByPeriod.forEach((group) => {
      const existingDataForLabel = group.data.find((data) => data.label === payoutQueryRow.label);

      if (!existingDataForLabel) {
        const labelPosition = this.getLabelPositionUntilPeriod(
          group.period,
          payoutQueryRow.label,
          asset,
          groupedByOperations
        );
        const value = group.period === period ? Number(payoutQueryRow.value) : 0;
        const yieldOnCost = labelPosition ? value / labelPosition : 0;

        group.data.push({
          label: payoutQueryRow.label,
          labelPosition,
          value,
          yield: yieldOnCost
        });
      }
    });
  }

  private getLabelPositionUntilPeriod(
    period: string,
    label: string,
    asset: Asset,
    operationsGroupedByLabelsMap: OperationsGroupedByLabels
  ): number {
    const periodFullDate = this.dateHelper.fillDate(period);
    const labelOperationsForPeriod =
      operationsGroupedByLabelsMap.get(label)?.filter((operation) => new Date(operation.date) < periodFullDate) || [];
    const quantityUntilPeriodDate = labelOperationsForPeriod.reduce(
      (totalQuantity, operation) => (totalQuantity += operation.quantity),
      0
    );
    let lastPriceBeforePeriodDate = asset.assetHistoricalPrices[asset.assetHistoricalPrices.length - 1];

    for (const assetHistoricalPrice of asset.assetHistoricalPrices) {
      if (new Date(assetHistoricalPrice.date) <= periodFullDate) {
        lastPriceBeforePeriodDate = assetHistoricalPrice;

        break;
      }
    }

    return quantityUntilPeriodDate * (lastPriceBeforePeriodDate?.closingPrice ?? 0);
  }
}
