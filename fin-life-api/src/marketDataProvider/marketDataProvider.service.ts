import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { assetPricesProviderConfig } from '../config/assetPricesProvider.config';
import { DateHelper } from '../common/helpers/date.helper';

export type AssetData = Omit<MarketData, 'values'> & { prices: AssetPrice[] };
export type AssetPrice = Value;
export type IndexData = Value;
interface MarketData {
  dividends: AssetDividend[];
  values: Value[];
  splits: AssetSplit[];
}
export interface AssetDividend {
  date: number;
  amount: number;
}
interface Value {
  close: number;
  date: number;
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
          hight: (number | null)[];
          low: (number | null)[];
          open: (number | null)[];
          voluem: (number | null)[];
        }[];
      };
    }[];
    error: any;
  };
}

@Injectable()
export class MarketDataProviderService {
  private readonly logger = new Logger(MarketDataProviderService.name);

  constructor(
    @Inject(assetPricesProviderConfig.KEY)
    private readonly appConfig: ConfigType<typeof assetPricesProviderConfig>,
    private readonly httpService: HttpService,
    private readonly dateHelper: DateHelper
  ) {}

  public async getAssetHistoricalData(ticker: string, fromDate?: Date, withEvents?: boolean): Promise<AssetData> {
    const data = await this.find(`${ticker}.SA`, fromDate, withEvents);

    return { dividends: data.dividends, prices: data.values, splits: data.splits };
  }

  public async getIndexHistoricalData(ticker: string, fromDate?: Date): Promise<IndexData[]> {
    const data = await this.find(ticker, fromDate);

    return data.values;
  }

  private async find(ticker: string, fromDate?: Date, withEvents?: boolean): Promise<MarketData> {
    const values: Value[] = [];
    let dividends: AssetDividend[] = [];
    let splits: AssetSplit[] = [];

    try {
      const params = {
        includeAdjustedClose: true,
        interval: '1d',
        period1: 1,
        period2: Date.now(),
        events: undefined
      };

      if (withEvents) {
        params.events = 'capitalGain|div|split';
      }

      const yahooFinanceHistoricalDataResponse = await lastValueFrom(
        this.httpService.get<YahooFinanceHistoricalDataResponse>(
          `${this.appConfig.basePath}/v8/finance/chart/${ticker.toUpperCase()}`,
          { params }
        )
      );
      const result = yahooFinanceHistoricalDataResponse.data.chart.result[0];

      result.timestamp
        .filter((timestamp) =>
          fromDate
            ? !this.dateHelper.isBefore(new Date(timestamp * 1000), new Date(fromDate.setHours(0, 0, 0, 0)))
            : true
        )
        .forEach((date, index) => {
          const close = result.indicators.adjclose[0].adjclose[index];

          if (close) {
            values.push({ date, close });
          }
        });

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
      console.log(error);

      const message = error.message as string;

      this.logger.error(message.charAt(0).toUpperCase() + message.slice(1));

      if (error.response?.status === 404) {
        return { dividends, values, splits };
      } else {
        throw error;
      }
    }
  }
}
