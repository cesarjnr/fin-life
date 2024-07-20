import { BadRequestException, Injectable } from '@nestjs/common';

import { DataIntervals } from '../common/enums/interval';
import { DateHelper } from '../common/helpers/date.helper';
import { BuysSellsService } from '../buysSells/buysSells.service';
import { AssetsService } from '../assets/assets.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';
import { Asset } from '../assets/asset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';

export interface GetPortfolioAssetProfitabilityParams {
  assetId: number;
  includeIndexes?: string[];
  interval?: DataIntervals;
  portfolioId: number;
}
export interface AssetProfitability {
  timestamps: number[];
  values: {
    [key: string]: number[];
  };
}

@Injectable()
export class ProfitabilitiesService {
  constructor(
    private readonly dateHelper: DateHelper,
    private readonly buysSellsService: BuysSellsService,
    private readonly assetsService: AssetsService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async getPortfolioAssetProfitability(
    params: GetPortfolioAssetProfitabilityParams
  ): Promise<AssetProfitability> {
    const { assetId, portfolioId, includeIndexes } = params;
    const interval = params.interval || DataIntervals.Monthly;
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'assetHistoricalPrices']
    });
    const { data } = await this.buysSellsService.get({ assetId, portfolioId });
    const adjustedBuysSells = data.map((buySell) => this.buysSellsService.getAdjustedBuySell(buySell, asset));
    const firstBuy = adjustedBuysSells[0];
    const dayAfterFirstBuy = this.dateHelper.incrementDays(new Date(firstBuy.date), 1);
    const filteredAssetHistoricalPrices = this.filterAssetHistoricalPricesFromDate(
      asset.assetHistoricalPrices,
      dayAfterFirstBuy
    );
    const marketIndexes = await this.getMarketIndexes(interval, includeIndexes, dayAfterFirstBuy);

    return this.getAssetDailyProfitability(asset, adjustedBuysSells, filteredAssetHistoricalPrices, marketIndexes);
  }

  private filterAssetHistoricalPricesFromDate(
    assetHistoricalPrices: AssetHistoricalPrice[],
    from: Date
  ): AssetHistoricalPrice[] {
    return assetHistoricalPrices.filter(
      (assetHistoricalPrice) => new Date(assetHistoricalPrice.date).getTime() >= from.getTime()
    );
  }

  private async getMarketIndexes(
    interval: DataIntervals,
    includeIndexes?: string[],
    fromDate?: Date
  ): Promise<Map<string, MarketIndexHistoricalData[]>> {
    const marketIndexes = new Map<string, MarketIndexHistoricalData[]>([]);

    if (includeIndexes?.length) {
      for (const marketIndex of includeIndexes) {
        let indexHistoricalData = await this.marketIndexHistoricalDataService.get({
          ticker: marketIndex,
          order: { date: 'DESC' }
        });

        this.checkIfIntervalsMatch(interval, indexHistoricalData[0]);

        if (fromDate) {
          indexHistoricalData = indexHistoricalData.filter(
            (indexData) => new Date(indexData.date).getTime() >= fromDate.getTime()
          );
        }

        marketIndexes.set(marketIndex.toUpperCase(), indexHistoricalData);
      }
    }

    return marketIndexes;
  }

  private checkIfIntervalsMatch(
    requestInterval: DataIntervals,
    marketIndexHistoricalData?: MarketIndexHistoricalData
  ): void {
    const { interval, ticker } = marketIndexHistoricalData;

    if (
      (requestInterval === DataIntervals.Daily &&
        (interval === DataIntervals.Monthly || interval === DataIntervals.Yearly)) ||
      (requestInterval === DataIntervals.Monthly && interval === DataIntervals.Yearly)
    ) {
      throw new BadRequestException(`Index ${ticker} interval does not match with selected interval`);
    }
  }

  private getAssetDailyProfitability(
    asset: Asset,
    buysSells: BuySell[],
    assetHistoricalPrices: AssetHistoricalPrice[],
    marketIndexesMap: Map<string, MarketIndexHistoricalData[]>
  ): AssetProfitability {
    const timestamps: number[] = [];
    const values = { [asset.ticker]: [] };

    assetHistoricalPrices.forEach((assetHistoricalPrice) => {
      let portfolioAssetValue = 0;
      const buysSellsBeforeAssetHistoricalPriceDate = buysSells.filter(
        (buySell) => new Date(buySell.date).getTime() <= new Date(assetHistoricalPrice.date).getTime()
      );
      let assetQuantityOnAssetHistoricalPriceDate: number = 0;
      let assetCostOnAssetHistoricalPriceDate: number = 0;

      buysSellsBeforeAssetHistoricalPriceDate.forEach((buySell) => {
        if (buySell.type === BuySellTypes.Buy) {
          assetQuantityOnAssetHistoricalPriceDate += buySell.quantity;
          assetCostOnAssetHistoricalPriceDate += buySell.quantity * buySell.price;
        } else {
          assetQuantityOnAssetHistoricalPriceDate -= buySell.quantity;
          portfolioAssetValue += buySell.quantity * buySell.price;
        }
      });

      portfolioAssetValue += assetHistoricalPrice.closingPrice * assetQuantityOnAssetHistoricalPriceDate;

      const profitability = portfolioAssetValue - assetCostOnAssetHistoricalPriceDate;
      const profitabilityInPercentage = Number(
        ((profitability / assetCostOnAssetHistoricalPriceDate) * 100).toFixed(2)
      );

      timestamps.push(new Date(assetHistoricalPrice.date).getTime());
      values[asset.ticker].push(profitabilityInPercentage);

      if (marketIndexesMap.size) {
        marketIndexesMap.forEach((indexData, ticker) => {
          if (!values[ticker]) {
            values[ticker] = [];
          }

          const indexDataClosestToCurrentHistoricalPrice = indexData.find(
            (data) => new Date(data.date).getTime() <= new Date(assetHistoricalPrice.date).getTime()
          );
          const indexDataVariationInPercentage = Number(
            (indexDataClosestToCurrentHistoricalPrice.value * 100).toFixed(2)
          );

          values[ticker].push(indexDataVariationInPercentage);
        });
      }
    });

    return { timestamps, values };
  }
}
