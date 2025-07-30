import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { assetPricesProviderConfig } from '../config/marketDataProvider.config';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexTypes } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';

export type AssetData = Omit<MarketData, 'values'> & { prices: AssetPrice[] };
export type AssetPrice = Value;
export type IndexData = Value;

interface MarketData {
  dividends?: AssetDividend[];
  values: Value[];
  splits?: AssetSplit[];
}
export interface AssetDividend {
  date: number;
  amount: number;
}
interface Value {
  close: number;
  date: number;
  high?: number;
}
export interface AssetSplit {
  date: number;
  denominator: number;
  numerator: number;
  ratio: string;
}
interface YahooFinanceHistoricalDataResponse {
  chart: {
    result: {
      timestamp: number[];
      events?: {
        dividends: {
          [key: string]: {
            amount: number;
            date: number;
          };
        };
        splits: {
          [key: string]: {
            date: number;
            numerator: number;
            denominator: number;
            splitRatio: string;
          };
        };
      };
      indicators: {
        adjclose: {
          adjclose: (number | null)[];
        }[];
        quote: {
          close: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          open: (number | null)[];
          voluem: (number | null)[];
        }[];
      };
    }[];
    error: any;
  };
}
interface BrazilianCentralBankHistoricalDataResponse {
  data: string;
  valor: string;
}

@Injectable()
export class MarketDataProviderService {
  private readonly logger = new Logger(MarketDataProviderService.name);
  private readonly indexTickersMap = new Map([
    ['cdi', 'cdi'],
    ['ipca', 'ipca'],
    ['USD/BRL', 'BRL=X']
  ]);
  private readonly indexesCodesMap = new Map([
    ['cdi', 12],
    ['ipca', 433]
  ]);

  constructor(
    @Inject(assetPricesProviderConfig.KEY)
    private readonly appConfig: ConfigType<typeof assetPricesProviderConfig>,
    private readonly httpService: HttpService,
    private readonly dateHelper: DateHelper
  ) {}

  public async getAssetHistoricalData(ticker: string, fromDate?: Date, withEvents?: boolean): Promise<AssetData> {
    const data = await this.findOnYahooFinanceApi(`${ticker}`, fromDate, withEvents);

    return { dividends: data.dividends, prices: data.values, splits: data.splits };
  }

  public async getIndexHistoricalData(ticker: string, type: MarketIndexTypes, fromDate?: Date): Promise<IndexData[]> {
    const mappedTicker = this.indexTickersMap.get(ticker);
    const data = await (type !== MarketIndexTypes.Rate
      ? this.findOnYahooFinanceApi(mappedTicker, fromDate)
      : this.findOnBrazilianCentralBankApi(mappedTicker));

    return data.values;
  }

  private async findOnYahooFinanceApi(ticker: string, fromDate?: Date, withEvents?: boolean): Promise<MarketData> {
    const mappedTicker = ticker.toUpperCase() === 'IBOV' ? '^BVSP' : ticker;
    const period1 = fromDate ?? new Date(0);
    const period2 = this.dateHelper.subtractDays(new Date(), 1);
    let values: Value[] = [];
    let dividends: AssetDividend[] = [];
    let splits: AssetSplit[] = [];

    period1.setUTCHours(0, 0, 0, 0);
    period2.setUTCHours(23, 59, 59, 59);

    try {
      const params = {
        includeAdjustedClose: false,
        interval: '1d',
        events: undefined,
        period1: Math.floor(period1.getTime() / 1000),
        period2: Math.floor(period2.getTime() / 1000)
      };

      if (withEvents) {
        params.events = 'div|split';
      }

      const yahooFinanceHistoricalDataResponse = await lastValueFrom(
        this.httpService.get<YahooFinanceHistoricalDataResponse>(
          `${this.appConfig.yahooFinanceApiBasePath}/v8/finance/chart/${mappedTicker}`,
          { params }
        )
      );

      const result = yahooFinanceHistoricalDataResponse.data.chart.result[0];

      values = result.timestamp
        .map((timestamp, index) => {
          const close = result.indicators.quote[0].close[index];
          const high = result.indicators.quote[0].high[index];

          return { date: timestamp * 1000, close, high };
        })
        .filter((value) => !!value.close);

      if (withEvents) {
        dividends = Object.keys(result.events?.dividends || [])
          .filter((dateStr) =>
            fromDate
              ? !this.dateHelper.isBefore(new Date(Number(dateStr)), new Date(fromDate.setHours(0, 0, 0, 0)))
              : true
          )
          .map((dateStr) => {
            const dividend = result.events?.dividends[dateStr];

            return {
              amount: dividend.amount,
              date: dividend.date
            };
          });
        splits = Object.keys(result.events?.splits || [])
          .filter((dateStr) =>
            fromDate
              ? !this.dateHelper.isBefore(new Date(Number(dateStr)), new Date(fromDate.setHours(0, 0, 0, 0)))
              : true
          )
          .map((dateStr) => {
            const split = result.events?.splits[dateStr];

            return {
              date: split.date,
              denominator: split.denominator,
              numerator: split.numerator,
              ratio: split.splitRatio
            };
          });
      }

      return { dividends, values, splits };
    } catch (error) {
      const message = error.message as string;

      this.logger.error(message.charAt(0).toUpperCase() + message.slice(1));

      if (error.response?.status === 404) {
        return { dividends, values, splits };
      } else {
        throw error;
      }
    }
  }

  private async findOnBrazilianCentralBankApi(index: string): Promise<MarketData> {
    const values: Value[] = [];
    const indexCode = this.indexesCodesMap.get(index.toLowerCase());

    if (!indexCode) {
      throw new NotFoundException('Index not found');
    }

    const brazilianCentralBankHistoricalDataResponse = await lastValueFrom(
      this.httpService.get<BrazilianCentralBankHistoricalDataResponse[]>(
        `${this.appConfig.brazilianCentralBankApiBasePath}.${indexCode}/dados`
      )
    );

    brazilianCentralBankHistoricalDataResponse.data.forEach((indexData) => {
      const adjustedDate = indexData.data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3');
      const date = new Date(adjustedDate);

      values.push({
        close: Number(indexData.valor),
        date: date.getTime()
      });
    });

    return { values };
  }
}
