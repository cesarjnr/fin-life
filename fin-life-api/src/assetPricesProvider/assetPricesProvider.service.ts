import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { assetPricesProviderConfig } from '../config/assetPricesProvider.config';

export interface AssetPrice {
  prices: {
    closing: number;
    date: string;
  }[];
  ticker: string;
}
interface AlphaVantageDailyAdjustedResponse {
  'Meta Data': DailyAdjustedMetaData;
  'Time Series (Daily)': DailyAdjustedTimeSeries;
}
interface DailyAdjustedMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': string;
  '5. Time Zone': string;
}
interface DailyAdjustedTimeSeries {
  [key: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. adjusted close': string;
    '6. volume': string;
    '7. dividend amount': string;
    '8. split coefficient': string;
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

  public async find(ticker: string, fromDate?: Date): Promise<AssetPrice> {
    try {
      const alphaVantageDailyAdjustedResponse = await lastValueFrom(
        this.httpService.get<AlphaVantageDailyAdjustedResponse>(this.appConfig.basePath, {
          params: {
            apikey: this.appConfig.apiKey,
            function: 'TIME_SERIES_DAILY_ADJUSTED',
            outputsize: fromDate ? 'compact' : 'full',
            symbol: `${ticker.toUpperCase()}.SAO`
          }
        })
      );
      const timeSeriesDaily = alphaVantageDailyAdjustedResponse.data['Time Series (Daily)'];
      const assetPrices: AssetPrice = {
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
    assetPrices: AssetPrice,
    timeSeriesDaily: DailyAdjustedTimeSeries,
    dateStr: string
  ): void {
    assetPrices.prices.push({
      closing: Number(timeSeriesDaily[dateStr]['5. adjusted close']),
      date: dateStr
    });
  }
}
