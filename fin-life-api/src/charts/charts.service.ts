import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DividendsChartData, GetChartDataDto } from './charts.dto';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';

@Injectable()
export class ChartsService {
  private readonly groupByFormatMap = new Map<string, string>([
    ['day', 'YYYY-MM-DD'],
    ['month', 'YYYY-MM'],
    ['year', 'YYYY']
  ]);

  constructor(
    @InjectRepository(PortfolioAssetDividend)
    private readonly portfoliosAssetsDividendsRepository: Repository<PortfolioAssetDividend>
  ) {}

  public async getDividendsChartData(getChartDataDto: GetChartDataDto): Promise<DividendsChartData[]> {
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
          existingLabelGroup.data.push({
            period: period,
            value: Number(period === row[groupBy] ? row.value : 0)
          });
        }
      });
    });

    return dividendsChartDataGroupedByLabel;
  }
}
