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
  values: Profitabilities;
}
interface Profitabilities {
  [key: string]: number[];
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
    const firstBuyDate = new Date(adjustedBuysSells[0].date);
    const dayAfterFirstBuy = this.dateHelper.incrementDays(firstBuyDate, 1);
    const filteredAssetHistoricalPrices = this.filterAssetHistoricalPricesFromDate(
      asset.assetHistoricalPrices,
      dayAfterFirstBuy
    );
    const marketIndexes = await this.getMarketIndexes(interval, includeIndexes, firstBuyDate);

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
        let indexHistoricalData = await this.marketIndexHistoricalDataService.get({ ticker: marketIndex });

        this.checkIfIntervalsMatch(interval, indexHistoricalData[0]);

        if (fromDate) {
          const mostRecentIndexDataBeforeFromDate = [...indexHistoricalData]
            .reverse()
            .find((indexData) => new Date(indexData.date).getTime() <= fromDate.getTime());

          indexHistoricalData = indexHistoricalData.filter(
            (indexData) =>
              new Date(indexData.date).getTime() >= new Date(mostRecentIndexDataBeforeFromDate.date).getTime()
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
    const firstBuyDate = new Date(buysSells[0].date);
    const timestamps: number[] = [firstBuyDate.getTime()];
    const values: Profitabilities = { [asset.ticker]: [0] };

    assetHistoricalPrices.forEach((assetHistoricalPrice) => {
      let portfolioAssetValue = 0;
      const buysSellsBeforeAssetHistoricalPriceDate = buysSells.filter(
        (buySell) => new Date(buySell.date).getTime() < new Date(assetHistoricalPrice.date).getTime()
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
        this.addMarketIndexesToProfitabilitiesObj(marketIndexesMap, values, assetHistoricalPrice);
      }
    });

    return { timestamps, values };
  }

  private addMarketIndexesToProfitabilitiesObj(
    marketIndexesMap: Map<string, MarketIndexHistoricalData[]>,
    profitabilitiesObj: Profitabilities,
    assetHistoricalPrice: AssetHistoricalPrice
  ): void {
    marketIndexesMap.forEach((indexHistoricalData, ticker) => {
      if (!profitabilitiesObj[ticker]) {
        profitabilitiesObj[ticker] = [0];
      }

      const indexHistoricaBeforeAssetHistoricalPriceDate = indexHistoricalData.filter((indexData) => {
        return new Date(indexData.date).getTime() < new Date(assetHistoricalPrice.date).getTime();
      });
      const compoundedIndexRate = indexHistoricaBeforeAssetHistoricalPriceDate.reduce(
        (totalRate, marketIndexHistoricalData) => {
          const compoundedIndexRate = 1 + marketIndexHistoricalData.value;

          return totalRate === 0 ? compoundedIndexRate : (totalRate *= compoundedIndexRate);
        },
        0
      );
      const compoundedRateInPercentage = Number(((compoundedIndexRate - 1) * 100).toFixed(2));

      profitabilitiesObj[ticker].push(compoundedRateInPercentage);
    });
  }
}
