import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PayoutsChart, GetPayoutsCharDto } from './charts.dto';
import { Payout } from '../payouts/payout.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { BuysSellsService } from '../buysSells/buysSells.service';
import { BuySell } from '../buysSells/buySell.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

type BuysSellsGroupedByLabels = Map<string, BuySell[]>;

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
    private readonly buysSellsService: BuysSellsService
  ) {}

  public async getPayoutsChart(portfolioId: number, getPayoutsChartDto: GetPayoutsCharDto): Promise<PayoutsChart[]> {
    const groupByPeriod = getPayoutsChartDto.groupByPeriod ?? 'month';
    const groupByAssetProp = getPayoutsChartDto.groupByAssetProp ?? 'ticker';
    const assets = await this.getPortfolioAssets(
      portfolioId,
      getPayoutsChartDto.assetId ? Number(getPayoutsChartDto.assetId) : undefined
    );
    const payoutsQueryResult = await this.getPayouts(groupByAssetProp, groupByPeriod, getPayoutsChartDto);
    const groupedBuysSells = await this.getBuysSellsGroupedByLabels(portfolioId, getPayoutsChartDto, groupByAssetProp);
    const payoutsChartGroupedByPeriod: PayoutsChart[] = [];

    payoutsQueryResult.forEach((row) => {
      const period = row[groupByPeriod];

      this.addPeriodToPayoutsChartDataGroups(payoutsChartGroupedByPeriod, period);
      this.addDataToPeriodGroups(assets, groupByAssetProp, row, payoutsChartGroupedByPeriod, groupedBuysSells, period);
    });

    return payoutsChartGroupedByPeriod;
  }

  private async getPortfolioAssets(portfolioId: number, assetId?: number): Promise<Asset[]> {
    const portfoliosAssets = await this.portfoliosAssetsRepository.find({
      where: { portfolioId, assetId },
      relations: ['asset.assetHistoricalPrices'],
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

  private async getBuysSellsGroupedByLabels(
    portfolioId: number,
    getPayoutsChartDto: GetPayoutsCharDto,
    label: string
  ): Promise<BuysSellsGroupedByLabels> {
    const buysSellsGroupedByLabelsMap: BuysSellsGroupedByLabels = new Map([]);
    const { data: buysSells } = await this.buysSellsService.get({
      portfolioId,
      assetId: getPayoutsChartDto.assetId,
      end: getPayoutsChartDto.end,
      relations: ['asset.splitHistoricalEvents']
    });
    const adjustedBuySells = buysSells.map((buySell) =>
      this.buysSellsService.getAdjustedBuySell(buySell, buySell.asset)
    );

    adjustedBuySells.forEach((buySell) => {
      const correspondingAssetGroup = buysSellsGroupedByLabelsMap.get(buySell.asset[label]);

      if (!correspondingAssetGroup) {
        buysSellsGroupedByLabelsMap.set(buySell.asset[label], [buySell]);
      } else {
        correspondingAssetGroup.push(buySell);
      }
    });

    return buysSellsGroupedByLabelsMap;
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
    groupedBySells: BuysSellsGroupedByLabels,
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
          groupedBySells
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
    buysSellsGroupedByLabelsMap: BuysSellsGroupedByLabels
  ): number {
    const periodFullDate = this.dateHelper.fillDate(period);
    const labelBuysSellsForPeriod = buysSellsGroupedByLabelsMap
      .get(label)
      .filter((buySell) => new Date(buySell.date) < periodFullDate);
    const quantityUntilPeriodDate = labelBuysSellsForPeriod.reduce(
      (totalQuantity, buySell) => (totalQuantity += buySell.quantity),
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
