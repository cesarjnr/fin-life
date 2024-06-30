import { Injectable } from '@nestjs/common';

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
  portfolioId: number;
  includeIndexes?: string[];
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
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'assetHistoricalPrices']
    });
    const { data } = await this.buysSellsService.get({ assetId, portfolioId });
    const adjustedBuysSells = data.map((buySell) => this.buysSellsService.getAdjustedBuySell(buySell, asset));
    const firstBuy = adjustedBuysSells[0];
    const filteredAssetHistoricalPrices = this.filterAssetHistoricalPricesFromDate(
      asset.assetHistoricalPrices,
      this.dateHelper.incrementDays(new Date(firstBuy.date), 1)
    );
    const marketIndexes = new Map<string, MarketIndexHistoricalData[]>([]);

    if (includeIndexes?.length) {
      for (const marketIndex of includeIndexes) {
        const indexHistoricalData = await this.marketIndexHistoricalDataService.get(marketIndex);

        marketIndexes.set(marketIndex, indexHistoricalData);
      }
    }

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

  private getAssetDailyProfitability(
    asset: Asset,
    buysSells: BuySell[],
    assetHistoricalPrices: AssetHistoricalPrice[],
    marketIndexesMap?: Map<string, MarketIndexHistoricalData[]>
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
    });

    return { timestamps, values };
  }
}
