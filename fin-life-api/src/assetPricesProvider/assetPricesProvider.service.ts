import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { assetPricesProviderConfig } from '../config/assetPricesProvider.config';

export interface AssetPrices {
  prices: {
    closing: number;
    date: string;
    splitCoefficient: number;
  }[];
  ticker: string;
}
interface AlphaVantageTimeSeriesDailyResponse {
  'Meta Data': TimeSeriesDailyMetaData;
  'Time Series (Daily)': TimeSeriesDailyTimeSeries;
}
interface TimeSeriesDailyMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': string;
  '5. Time Zone': string;
}
interface TimeSeriesDailyTimeSeries {
  [key: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    // '5. adjusted close': string;
    // '6. volume': string;
    // '7. dividend amount': string;
    // '8. split coefficient': string;
  };
}

@Injectable()
export class AssetPricesProviderService {
  private readonly logger = new Logger(AssetPricesProviderService.name);

  constructor(
    @Inject(assetPricesProviderConfig.KEY)
    private readonly appConfig: ConfigType<typeof assetPricesProviderConfig>,
    private readonly httpService: HttpService
  ) {}

  public async find(ticker: string, fromDate?: Date): Promise<AssetPrices> {
    try {
      const alphaVantageDailyAdjustedResponse = await lastValueFrom(
        this.httpService.get<AlphaVantageTimeSeriesDailyResponse>(this.appConfig.basePath, {
          params: {
            apikey: this.appConfig.apiKey,
            function: 'TIME_SERIES_DAILY',
            outputsize: fromDate ? 'compact' : 'full',
            symbol: `${ticker.toUpperCase()}.SAO`
          }
        })
      );
      const timeSeriesDaily = alphaVantageDailyAdjustedResponse.data['Time Series (Daily)'];
      const assetPrices: AssetPrices = {
        prices: [],
        ticker
      };

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
      }

      for (const dateStr of Object.keys(timeSeriesDaily).reverse()) {
        if (fromDate) {
          const date = new Date(dateStr);

          date.setHours(0, 0, 0, 0);

          if (date >= fromDate) {
            this.appendPriceToAssetPricesList(assetPrices, timeSeriesDaily, dateStr);
          }
        } else {
          this.appendPriceToAssetPricesList(assetPrices, timeSeriesDaily, dateStr);
        }
      }

      return assetPrices;
    } catch (error) {
      const message = error.message as string;

      this.logger.error(message.charAt(0).toUpperCase() + message.slice(1));

      throw error;
    }
  }

  private appendPriceToAssetPricesList(
    assetPrices: AssetPrices,
    timeSeriesDaily: TimeSeriesDailyTimeSeries,
    dateStr: string
  ): void {
    const day = timeSeriesDaily[dateStr];

    assetPrices.prices.push({
      closing: Number(day['4. close'] /* ) - Number(day['7. dividend amount'] */),
      date: dateStr,
      splitCoefficient: 0 /* Number(day['8. split coefficient']) */
    });
  }
}
