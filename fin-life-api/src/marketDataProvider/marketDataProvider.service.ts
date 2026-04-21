import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { assetPricesProviderConfig } from '../config/marketDataProvider.config';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexTypes } from '../marketIndexes/marketIndex.entity';

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
interface BrazilianCentralBankRatesHistoricalDataResponse {
  data: string;
  valor: string;
}
interface BrazilianCentralBankCurrenciesHistoricalDataResponse {
  '@odata.context': string;
  value: {
    dataHoraCotacao: string;
    cotacaoCompra: string;
  }[];
}

@Injectable()
export class MarketDataProviderService {
  private readonly logger = new Logger(MarketDataProviderService.name);
  private readonly brazilianCentralBankIndexesCodesMap = new Map([
    ['DI', 12],
    ['IPCA', 433]
  ]);

  constructor(
    @Inject(assetPricesProviderConfig.KEY)
    private readonly appConfig: ConfigType<typeof assetPricesProviderConfig>,
    private readonly httpService: HttpService,
    private readonly dateHelper: DateHelper
  ) { }

  public async getAssetHistoricalData(code: string, fromDate?: Date, withEvents?: boolean): Promise<AssetData> {
    const data = await this.findOnYahooFinanceApi(code, fromDate, withEvents);

    return { dividends: data.dividends, prices: data.values, splits: data.splits };
  }

  public async getIndexHistoricalData(code: string, from?: Date, to?: Date): Promise<IndexData[]> {
    const data = await this.findOnBrazilianCentralBankApi(code, from, to);

    return data.values;
  }

  private async findOnYahooFinanceApi(code: string, from?: Date, withEvents?: boolean): Promise<MarketData> {
    this.logger.log(`[findOnYahooFinanceApi] Fetching data for ${code}...`);

    const mappedCode = code.toUpperCase() === 'IBOV' ? '^BVSP' : code;
    const period1 = from ?? new Date(0);
    const period2 = this.dateHelper.subtractDays(new Date(), 1);
    let values: Value[] = [];
    let dividends: AssetDividend[] = [];
    let splits: AssetSplit[] = [];

    period2.setUTCHours(23, 59, 59, 999);

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
          `${this.appConfig.yahooFinanceApiBasePath}/v8/finance/chart/${mappedCode}`,
          { params }
        )
      );
      const result = yahooFinanceHistoricalDataResponse.data.chart.result[0];

      this.logger.log(`[findOnYahooFinanceApi] ${result.timestamp.length} data found`);

      values =
        result.timestamp
          ?.map((timestamp, index) => {
            const close = result.indicators.quote[0].close[index];

            return { date: timestamp * 1000, close };
          })
          .filter((value) => !!value.close) || [];

      if (withEvents) {
        dividends = Object.keys(result.events?.dividends || []).map((dateStr) => {
          const dividend = result.events?.dividends[dateStr];

          return {
            amount: dividend.amount,
            date: dividend.date
          };
        });
        splits = Object.keys(result.events?.splits || []).map((dateStr) => {
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
      const message = error.response.data.chart?.error?.description || error.message;
      const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);

      this.logger.error(`[findOnYahooFinanceApi] Error when retrieving data for ${code}: ${formattedMessage}`);

      if (error.response?.status === 404) {
        return { dividends, values, splits };
      } else {
        throw new InternalServerErrorException('Something went wrong. Try again later!');
      }
    }
  }

  private async findOnBrazilianCentralBankApi(index: string, from?: Date, to?: Date): Promise<MarketData> {
    this.logger.log(`[findOnBrazilianCentralBankApi] Fetching data for ${index}...`);

    const today = new Date();
    const parsedFrom = from || this.dateHelper.startOfMonth(today);
    const parsedTo = to || today;

    parsedTo.setUTCHours(23, 59, 59, 59);

    if (index === 'USD/BRL') {
      return await this.fetchDataOnBrazilianCentralBankCurrenciesApi(index, parsedFrom, parsedTo);
    } else {
      return await this.fetchDataOnBrazilianCentralBankRatesApi(index, parsedFrom, parsedTo);
    }
  }

  private async fetchDataOnBrazilianCentralBankRatesApi(index: string, from: Date, to: Date): Promise<MarketData> {
    const values: Value[] = [];

    try {
      const indexCode = this.brazilianCentralBankIndexesCodesMap.get(index);

      if (!indexCode) {
        throw new NotFoundException('Index not found');
      }

      const params = {
        formato: 'json',
        dataInicial: this.dateHelper.format(from, 'dd/MM/yyyy'),
        dataFinal: this.dateHelper.format(to, 'dd/MM/yyyy')
      };
      const brazilianCentralBankHistoricalRateDataResponse = await lastValueFrom(
        this.httpService.get<BrazilianCentralBankRatesHistoricalDataResponse[]>(
          `${this.appConfig.brazilianCentralBankRatesApiBasePath}.${indexCode}/dados`,
          { params }
        )
      );

      this.logger.log(
        `[fetchDataOnBrazilianCentralBankRatesApi] ${brazilianCentralBankHistoricalRateDataResponse.data.length} data found`
      );

      brazilianCentralBankHistoricalRateDataResponse.data.forEach((indexData) => {
        const adjustedDate = indexData.data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3');
        const date = new Date(adjustedDate);

        date.setUTCHours(0, 0, 0, 0);

        values.push({
          close: Number(indexData.valor),
          date: date.getTime()
        });
      });
    } catch (error) {
      this.logger.error(`[fetchDataOnBrazilianCentralBankRatesApi] Error when retrieving data for ${index}: ${error.message}`);
    } finally {
      return { values };
    }
  }

  private async fetchDataOnBrazilianCentralBankCurrenciesApi(index: string, from: Date, to: Date): Promise<MarketData> {
    const values: Value[] = [];

    try {
      const brazilianCentralBankHistoricalCurrencyDataResponse = await lastValueFrom(
        this.httpService.get<BrazilianCentralBankCurrenciesHistoricalDataResponse>(
          `${this.appConfig.brazilianCentralBankCurrenciesApiBasePath}/CotacaoDolarPeriodo(dataInicial='${this.dateHelper.format(from, 'MM-dd-yyyy')}',dataFinalCotacao='${this.dateHelper.format(to, 'MM-dd-yyyy')}')`,
          { params: { '$format': 'json', '$select': 'cotacaoCompra,dataHoraCotacao' } }
        )
      );

      this.logger.log(
        `[fetchDataOnBrazilianCentralBankCurrenciesApi] ${brazilianCentralBankHistoricalCurrencyDataResponse.data.value.length} data found`
      );

      brazilianCentralBankHistoricalCurrencyDataResponse.data.value.forEach((indexData) => {
        const date = new Date(indexData.dataHoraCotacao);

        date.setUTCHours(0, 0, 0, 0);

        values.push({
          close: Number(indexData.cotacaoCompra),
          date: date.getTime()
        });
      });
    } catch (error) {
      this.logger.error(`[fetchDataOnBrazilianCentralBankCurrenciesApi] Error when retrieving data for ${index}: ${error.message}`);
    } finally {
      return { values };
    }
  }
}
