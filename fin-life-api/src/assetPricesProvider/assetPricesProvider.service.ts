import { Injectable } from '@nestjs/common';

import caml3PricesJson from '../../caml3_prices.json';
import wege3PricesJson from '../../wege3_prices.json';

export interface AssetPrice {
  prices: {
    closing: number;
    date: string;
  }[];
  ticker: string;
}
interface AlphaVantageDailyAdjustedResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
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
  };
}

@Injectable()
export class AssetPricesProviderService {
  public async find(ticker: string, fromDate: Date): Promise<AssetPrice> {
    const alphaVantageDailyAdjustedResponse = caml3PricesJson as AlphaVantageDailyAdjustedResponse;
    const timeSeriesDaily = alphaVantageDailyAdjustedResponse['Time Series (Daily)'];
    const assetPrices: AssetPrice = {
      prices: [],
      ticker
    };

    fromDate.setHours(0, 0, 0, 0);

    for (const dateStr in timeSeriesDaily) {
      const date = new Date(dateStr);

      date.setHours(0, 0, 0, 0);

      if (date >= fromDate) {
        assetPrices.prices.push({
          closing: Number(timeSeriesDaily[dateStr]['5. adjusted close']),
          date: dateStr
        });
      }
    }

    return assetPrices;
  }
}
