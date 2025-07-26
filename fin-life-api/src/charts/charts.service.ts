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

@Injectable()
export class ChartsService {
  private readonly groupByFormatMap = new Map<string, string>([
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
    const assets = await this.getPortfolioAssets(portfolioId);
    const groupedBuysSellsMap = await this.getBuysSellsGroupedByLabels(portfolioId, getChartDataDto);
    const groupByPeriod = getChartDataDto.groupByPeriod ?? 'day';
    // const groupByAssetProp = getChartDataDto.groupByAssetProp ?? 'ticker';
    const groupByFormat = this.groupByFormatMap.get(groupByPeriod);
    const builder = this.portfoliosAssetsDividendsRepository
      .createQueryBuilder('portfoliosAssetsDividends')
      .select('asset.ticker', 'label')
      .addSelect(`TO_CHAR(portfoliosAssetsDividends.date, '${groupByFormat}')`, groupByPeriod)
      .addSelect('SUM(portfoliosAssetsDividends.total)', 'value')
      .leftJoin('portfoliosAssetsDividends.portfolioAsset', 'portfolioAsset')
      .leftJoin('portfolioAsset.asset', 'asset')
      .groupBy(groupByPeriod)
      .addGroupBy('label')
      .orderBy(groupByPeriod, 'ASC');

    if (getChartDataDto.assetId) {
      builder.where('asset.id = :assetId', { assetId: Number(getChartDataDto.assetId) });
    }

    if (getChartDataDto.start) {
      builder.andWhere('portfoliosAssetsDividends.date >= :start', { start: getChartDataDto.start });
    }

    if (getChartDataDto.end) {
      builder.andWhere('portfoliosAssetsDividends.date <= :end', { end: getChartDataDto.end });
    }

    const result = await builder.getRawMany();
    const dividendsChartDataGroupedByPeriod: DividendsChartData[] = [];

    result.forEach((row) => {
      const asset = assets.find((asset) => asset.ticker === row.label);
      let existingPeriodGroup = dividendsChartDataGroupedByPeriod.find((group) => group.period === row[groupByPeriod]);

      if (!existingPeriodGroup) {
        existingPeriodGroup = {
          period: row[groupByPeriod],
          data: []
        };

        dividendsChartDataGroupedByPeriod.push(existingPeriodGroup);
      }

      dividendsChartDataGroupedByPeriod.forEach((group) => {
        const existingDataForLabel = group.data.find((data) => data.label === row.label);

        if (!existingDataForLabel) {
          const labelPosition = this.getLabelPositionUntilPeriod(group.period, asset, groupedBuysSellsMap);
          const value = group.period === row[groupByPeriod] ? Number(row.value) : 0;
          const yieldOnCost = labelPosition ? value / labelPosition : 0;

          group.data.push({
            label: row.label,
            labelPosition,
            value,
            yield: yieldOnCost
          });
        }
      });
    });

    return dividendsChartDataGroupedByPeriod;
  }

  private async getPortfolioAssets(portfolioId: number): Promise<Asset[]> {
    const portfoliosAssets = await this.portfoliosAssetsRepository.find({
      where: { portfolioId },
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
    getChartDataDto: GetChartDataDto
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
      const correspondingAssetGroup = buysSellsGroupedByLabelsMap.get(buySell.asset.ticker);

      if (!correspondingAssetGroup) {
        buysSellsGroupedByLabelsMap.set(buySell.asset.ticker, [buySell]);
      } else {
        correspondingAssetGroup.push(buySell);
      }
    });

    return buysSellsGroupedByLabelsMap;
  }

  private getLabelPositionUntilPeriod(
    period: string,
    asset: Asset,
    buysSellsGroupedByLabelsMap: BuysSellsGroupedByLabels
  ): number {
    const periodFullDate = this.dateHelper.fillDate(period);
    const labelBuysSellsForPeriod = buysSellsGroupedByLabelsMap
      .get(asset.ticker)
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
