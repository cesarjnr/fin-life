import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PayoutsChart, GetPayoutsCharDto } from './charts.dto';
import { Payout } from '../payouts/payout.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { OperationsService } from '../operations/operations.service';
import { Operation } from '../operations/operation.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

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
  private readonly groupByPeriodFormatMap = new Map<string, string>([
    ['day', 'YYYY-MM-DD'],
    ['month', 'YYYY-MM'],
    ['year', 'YYYY']
  ]);

  constructor(
    @InjectRepository(Payout)
    private readonly payoutsRepository: Repository<Payout>,
    @InjectRepository(PortfolioAsset)
    private readonly portfoliosAssetsRepository: Repository<PortfolioAsset>,
    private readonly dateHelper: DateHelper,
    private readonly operationsService: OperationsService
  ) {}

  public async getPayoutsChart(portfolioId: number, getPayoutsChartDto: GetPayoutsCharDto): Promise<PayoutsChart[]> {
    const payoutsChartGroupedByPeriod: PayoutsChart[] = [];
    const groupByPeriod = getPayoutsChartDto.groupByPeriod ?? 'month';
    const groupByAssetProp = getPayoutsChartDto.groupByAssetProp ?? 'code';
    const assets = await this.getAssets(
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

  private async getAssets(portfolioId: number, assetId?: number): Promise<Asset[]> {
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

      return this.operationsService.getAdjustedOperation(operation, operationAsset);
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
    const builder = this.payoutsRepository
      .createQueryBuilder('payout')
      .select(`asset.${groupByAssetProp}`, 'label')
      .addSelect(`TO_CHAR(payout.date, '${groupByPeriodFormat}')`, groupByPeriod)
      .addSelect(
        `
          SUM(
            CASE
              WHEN payout.currency = 'USD'
                THEN
                  CASE
                    WHEN payout.withdrawal_date_exchange_rate > 0
                      THEN payout.withdrawal_date_exchange_rate * payout.total
                    WHEN payout.received_date_exchange_rate > 0
                      THEN payout.received_date_exchange_rate * payout.total
                    ELSE
                      0
                  END
              ELSE
                payout.total
            END
        )
        `,
        'value'
      )
      .leftJoin('payout.portfolioAsset', 'portfolioAsset')
      .leftJoin('portfolioAsset.asset', 'asset')
      .groupBy(groupByPeriod)
      .addGroupBy('label')
      .orderBy(groupByPeriod, 'ASC');

    if (getPayoutsChartDto.assetId) {
      builder.where('asset.id = :assetId', { assetId: Number(getPayoutsChartDto.assetId) });
    }

    if (getPayoutsChartDto.start) {
      builder.andWhere('payout.date >= :start', { start: getPayoutsChartDto.start });
    }

    if (getPayoutsChartDto.end) {
      builder.andWhere('payout.date <= :end', { end: getPayoutsChartDto.end });
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
