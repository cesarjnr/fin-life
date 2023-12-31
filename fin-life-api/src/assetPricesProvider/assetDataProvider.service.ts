import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { assetPricesProviderConfig } from '../config/assetPricesProvider.config';

export interface AssetData {
  dividends: AssetDividend[];
  prices: AssetPrice[];
  splits: AssetSplit[];
}
export interface AssetDividend {
  date: number;
  amount: number;
}
export interface AssetPrice {
  closing: number;
  date: number;
}
export interface AssetSplit {
  date: number;
  denominator: number;
  numerator: number;
  ratio: string;
}
// interface AlphaVantageTimeSeriesDailyResponse {
//   'Meta Data': TimeSeriesDailyMetaData;
//   'Time Series (Daily)': TimeSeriesDailyTimeSeries;
// }
// interface TimeSeriesDailyMetaData {
//   '1. Information': string;
//   '2. Symbol': string;
//   '3. Last Refreshed': string;
//   '4. Output Size': string;
//   '5. Time Zone': string;
// }
// interface TimeSeriesDailyTimeSeries {
//   [key: string]: {
//     '1. open': string;
//     '2. high': string;
//     '3. low': string;
//     '4. close': string;
//     // '5. adjusted close': string;
//     // '6. volume': string;
//     // '7. dividend amount': string;
//     // '8. split coefficient': string;
//   };
// }
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
      };
    }[];
    error: any;
  };
}

@Injectable()
export class AssetDataProviderService {
  private readonly logger = new Logger(AssetDataProviderService.name);

  constructor(
    @Inject(assetPricesProviderConfig.KEY)
    private readonly appConfig: ConfigType<typeof assetPricesProviderConfig>,
    private readonly httpService: HttpService
  ) {}

  public async find(ticker: string, fromDate?: Date, withEvents?: boolean): Promise<AssetData> {
    try {
      const params = {
        includeAdjustedClose: true,
        interval: '1d',
        period1: fromDate ? fromDate.setHours(0, 0, 0, 0) : 1,
        period2: Date.now(),
        events: undefined
      };

      if (withEvents) {
        params.events = 'capitalGain|div|split';
      }

      const yahooFinanceHistoricalDataResponse = await lastValueFrom(
        this.httpService.get<YahooFinanceHistoricalDataResponse>(
          `${this.appConfig.basePath}/v8/finance/chart/${ticker.toUpperCase()}.SA`,
          { params }
        )
      );
      const result = yahooFinanceHistoricalDataResponse.data.chart.result[0];
      const assetPrices: AssetPrice[] = [];

      result.timestamp.forEach((date, index) => {
        const closingPrices = result.indicators.adjclose[0].adjclose;
        const closing = closingPrices[index];

        if (closing) {
          assetPrices.push({ date, closing });
        }
      });

      const assetDividends: AssetDividend[] = Object.keys(result.events?.dividends || []).map((dateStr) => {
        const dividend = result.events!.dividends[dateStr];

        return {
          amount: dividend.amount,
          date: dividend.date
        };
      });
      const assetSplits: AssetSplit[] = Object.keys(result.events?.splits || []).map((dateStr) => {
        const split = result.events!.splits[dateStr];

        return {
          date: split.date,
          denominator: split.denominator,
          numerator: split.numerator,
          ratio: split.splitRatio
        };
      });

      return { dividends: assetDividends, prices: assetPrices, splits: assetSplits };

      // const alphaVantageDailyAdjustedResponse = await lastValueFrom(
      //   this.httpService.get<AlphaVantageTimeSeriesDailyResponse>(this.appConfig.basePath, {
      //     params: {
      //       apikey: this.appConfig.apiKey,
      //       function: 'TIME_SERIES_DAILY',
      //       outputsize: fromDate ? 'compact' : 'full',
      //       symbol: `${ticker.toUpperCase()}.SAO`
      //     }
      //   })
      // );
      // const timeSeriesDaily = alphaVantageDailyAdjustedResponse.data['Time Series (Daily)'];
      // const assetPrices: AssetPrices = {
      //   prices: [],
      //   ticker
      // };

      // if (fromDate) {
      //   fromDate.setHours(0, 0, 0, 0);
      // }

      // for (const dateStr of Object.keys(timeSeriesDaily).reverse()) {
      //   if (fromDate) {
      //     const date = new Date(dateStr);

      //     date.setHours(0, 0, 0, 0);

      //     if (date >= fromDate) {
      //       this.appendPriceToAssetPricesList(assetPrices, timeSeriesDaily, dateStr);
      //     }
      //   } else {
      //     this.appendPriceToAssetPricesList(assetPrices, timeSeriesDaily, dateStr);
      //   }
      // }
    } catch (error) {
      const message = error.message as string;

      this.logger.error(message.charAt(0).toUpperCase() + message.slice(1));

      throw error;
    }
  }

  // private appendPriceToAssetPricesList(
  //   assetPrices: AssetPrices,
  //   timeSeriesDaily: TimeSeriesDailyTimeSeries,
  //   dateStr: string
  // ): void {
  //   const day = timeSeriesDaily[dateStr];

  //   assetPrices.prices.push({
  //     closing: Number(day['4. close'] /* ) - Number(day['7. dividend amount'] */),
  //     date: dateStr,
  //     splitCoefficient: 0 /* Number(day['8. split coefficient']) */
  //   });
  // }
}
