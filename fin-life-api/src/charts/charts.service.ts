import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetChartDataDto } from './charts.dto';
import { PortfolioAssetDividend } from '../portfoliosAssetsDividends/portfolioAssetDividend.entity';

export interface DividendsChartData {
  date: string;
  ticker: string;
  value: number;
}

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
    const groupByFormat = this.groupByFormatMap.get(getChartDataDto.groupBy ?? 'day');
    const builder = this.portfoliosAssetsDividendsRepository
      .createQueryBuilder('portfoliosAssetsDividends')
      .select('asset.ticker', 'ticker')
      .addSelect(`TO_CHAR(portfoliosAssetsDividends.date, '${groupByFormat}')`, 'date')
      .addSelect('SUM(portfoliosAssetsDividends.total)', 'value')
      .leftJoin('portfoliosAssetsDividends.portfolioAsset', 'portfolioAsset')
      .leftJoin('portfolioAsset.asset', 'asset')
      .groupBy('date')
      .addGroupBy('asset.ticker')
      .orderBy('date', 'ASC');

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

    return result.map((row) => ({
      date: row.date,
      ticker: row.ticker,
      value: Number(row.value)
    }));
  }
}
