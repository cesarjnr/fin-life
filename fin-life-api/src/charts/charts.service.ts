import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DividendsChartData, GetChartDataDto } from './charts.dto';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { BuysSellsService } from '../buysSells/buysSells.service';
import { BuySell } from '../buysSells/buySell.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

type BuysSellsGroupedByLabels = Map<string, BuySell[]>;

interface PortfolioAssetDividendQueryRow {
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
    @InjectRepository(PortfolioAssetDividend)
    private readonly portfoliosAssetsDividendsRepository: Repository<PortfolioAssetDividend>,
    @InjectRepository(PortfolioAsset)
    private readonly portfoliosAssetsRepository: Repository<PortfolioAsset>,
    private readonly dateHelper: DateHelper,
    private readonly buysSellsService: BuysSellsService
  ) {}

  public async getDividendsChartData(
    portfolioId: number,
    getChartDataDto: GetChartDataDto
  ): Promise<DividendsChartData[]> {
    const groupByPeriod = getChartDataDto.groupByPeriod ?? 'month';
    const groupByAssetProp = getChartDataDto.groupByAssetProp ?? 'ticker';
    const assets = await this.getPortfolioAssets(
      portfolioId,
      getChartDataDto.assetId ? Number(getChartDataDto.assetId) : undefined
    );
    const portfoliosAssetsDividendsQueryResult = await this.getPortfolioAssetsDividends(
      groupByAssetProp,
      groupByPeriod,
      getChartDataDto
    );
    const groupedBuysSells = await this.getBuysSellsGroupedByLabels(portfolioId, getChartDataDto, groupByAssetProp);
    const dividendsChartDataGroupedByPeriod: DividendsChartData[] = [];

    portfoliosAssetsDividendsQueryResult.forEach((row) => {
      const period = row[groupByPeriod];

      this.addPeriodToDividendsChartDataGroups(dividendsChartDataGroupedByPeriod, period);
      this.addDataToPeriodGroups(
        assets,
        groupByAssetProp,
        row,
        dividendsChartDataGroupedByPeriod,
        groupedBuysSells,
        period
      );
    });

    return dividendsChartDataGroupedByPeriod;
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
    getChartDataDto: GetChartDataDto,
    label: string
  ): Promise<BuysSellsGroupedByLabels> {
    const buysSellsGroupedByLabelsMap: BuysSellsGroupedByLabels = new Map([]);
    const { data: buysSells } = await this.buysSellsService.get({
      portfolioId,
      assetId: getChartDataDto.assetId,
      end: getChartDataDto.end,
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

  private async getPortfolioAssetsDividends(
    groupByAssetProp: string,
    groupByPeriod: string,
    getChartDataDto: GetChartDataDto
  ): Promise<PortfolioAssetDividendQueryRow[]> {
    const groupByPeriodFormat = this.groupByPeriodFormatMap.get(groupByPeriod);
    const builder = this.portfoliosAssetsDividendsRepository
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
                      THEN payout.received_date_exchange_rate * total
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

    if (getChartDataDto.assetId) {
      builder.where('asset.id = :assetId', { assetId: Number(getChartDataDto.assetId) });
    }

    if (getChartDataDto.start) {
      builder.andWhere('payout.date >= :start', { start: getChartDataDto.start });
    }

    if (getChartDataDto.end) {
      builder.andWhere('payout.date <= :end', { end: getChartDataDto.end });
    }

    return await builder.getRawMany();
  }

  private addPeriodToDividendsChartDataGroups(
    dividendsChartDataGroupedByPeriod: DividendsChartData[],
    period: string
  ): void {
    let existingPeriodGroup = dividendsChartDataGroupedByPeriod.find((group) => group.period === period);

    if (!existingPeriodGroup) {
      existingPeriodGroup = {
        period: period,
        data: []
      };

      dividendsChartDataGroupedByPeriod.push(existingPeriodGroup);
    }
  }

  private addDataToPeriodGroups(
    assets: Asset[],
    groupByAssetProp: string,
    portfolioAssetDividendQueryRow: PortfolioAssetDividendQueryRow,
    dividendsChartDataGroupedByPeriod: DividendsChartData[],
    groupedBySells: BuysSellsGroupedByLabels,
    period: string
  ): void {
    const asset = assets.find((asset) => asset[groupByAssetProp] === portfolioAssetDividendQueryRow.label);

    dividendsChartDataGroupedByPeriod.forEach((group) => {
      const existingDataForLabel = group.data.find((data) => data.label === portfolioAssetDividendQueryRow.label);

      if (!existingDataForLabel) {
        const labelPosition = this.getLabelPositionUntilPeriod(
          group.period,
          portfolioAssetDividendQueryRow.label,
          asset,
          groupedBySells
        );
        const value = group.period === period ? Number(portfolioAssetDividendQueryRow.value) : 0;
        const yieldOnCost = labelPosition ? value / labelPosition : 0;

        group.data.push({
          label: portfolioAssetDividendQueryRow.label,
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
