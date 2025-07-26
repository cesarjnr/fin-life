import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DividendsChartData, GetChartDataDto } from './charts.dto';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { BuysSellsService } from '../buysSells/buysSells.service';
import { BuySell } from '../buysSells/buySell.entity';
import { Asset } from '../assets/asset.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';

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
    const assets = portfoliosAssets.map((portfolioAsset) => portfolioAsset.asset);
    const { data: buysSells } = await this.buysSellsService.get({
      portfolioId,
      assetId: getChartDataDto.assetId,
      end: getChartDataDto.end,
      relations: ['asset.splitHistoricalEvents']
    });
    const adjustedBuySells = buysSells.map((buySell) =>
      this.buysSellsService.getAdjustedBuySell(buySell, buySell.asset)
    );
    const groupBy = getChartDataDto.groupBy ?? 'day';
    const groupByFormat = this.groupByFormatMap.get(groupBy);
    const builder = this.portfoliosAssetsDividendsRepository
      .createQueryBuilder('portfoliosAssetsDividends')
      .select('asset.ticker', 'label')
      .addSelect(`TO_CHAR(portfoliosAssetsDividends.date, '${groupByFormat}')`, groupBy)
      .addSelect('SUM(portfoliosAssetsDividends.total)', 'value')
      .leftJoin('portfoliosAssetsDividends.portfolioAsset', 'portfolioAsset')
      .leftJoin('portfolioAsset.asset', 'asset')
      .groupBy(groupBy)
      .addGroupBy('label')
      .orderBy(groupBy, 'ASC');

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
    const dividendsChartDataGroupedByLabel: DividendsChartData[] = [];
    const availablePeriods: string[] = [];

    result.forEach((row) => {
      const asset = assets.find((asset) => asset.ticker === row.label);
      let existingLabelGroup = dividendsChartDataGroupedByLabel.find((group) => group.label === row.label);

      if (!existingLabelGroup) {
        existingLabelGroup = {
          label: row.label,
          data: []
        };

        dividendsChartDataGroupedByLabel.push(existingLabelGroup);
      }

      if (!availablePeriods.includes(row[groupBy])) {
        availablePeriods.push(row[groupBy]);
      }

      availablePeriods.forEach((period) => {
        const existingDataForPeriod = existingLabelGroup.data.find((data) => data.period === period);

        if (!existingDataForPeriod) {
          const value = Number(period === row[groupBy] ? row.value : 0);

          existingLabelGroup.data.push({
            period: period,
            value,
            yield: this.getPayoutYield(period, value, asset, adjustedBuySells)
          });
        }
      });
    });

    return dividendsChartDataGroupedByLabel;
  }

  private getPayoutYield(period: string, value: number, asset: Asset, buysSells: BuySell[]): number {
    const periodFullDate = this.dateHelper.fillDate(period);
    const quantityUntilPeriodDate = buysSells
      .filter((buySell) => new Date(buySell.date) < periodFullDate)
      .reduce((totalQuantity, buySell) => (totalQuantity += buySell.quantity), 0);
    let lastPriceBeforePeriodDate: AssetHistoricalPrice;

    for (const assetHistoricalPrice of asset.assetHistoricalPrices) {
      if (new Date(assetHistoricalPrice.date) < periodFullDate) {
        lastPriceBeforePeriodDate = assetHistoricalPrice;

        break;
      }
    }

    console.log({ periodFullDate, buysSells, quantityUntilPeriodDate, lastPriceBeforePeriodDate });

    return 0;
  }
}
