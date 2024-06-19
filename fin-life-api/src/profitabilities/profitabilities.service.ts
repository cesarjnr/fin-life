import { Injectable } from '@nestjs/common';

import { BuysSellsService } from '../buysSells/buysSells.service';
import { AssetsService } from '../assets/assets.service';
import { DateHelper } from '../common/helpers/date.helper';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { BuySell, BuySellTypes } from '../buysSells/buySell.entity';

export interface AssetProfitability {
  timestamps: number[];
  values: number[];
}

@Injectable()
export class ProfitabilitiesService {
  constructor(
    private readonly buysSellsService: BuysSellsService,
    private readonly assetsService: AssetsService,
    private readonly dateHelper: DateHelper
  ) {}

  public async getPortfolioAssetProfitability(assetId: number, portfolioId: number): Promise<AssetProfitability> {
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'assetHistoricalPrices']
    });
    const { data } = await this.buysSellsService.get({ assetId, portfolioId });
    const adjustedBuysSells = data.map((buySell) => this.buysSellsService.getAdjustedBuySellValue(buySell, asset));
    const firstBuy = adjustedBuysSells[0];
    const filteredAssetHistoricalPrices = this.filterAssetHistoricalPricesFromDate(
      asset.assetHistoricalPrices,
      this.dateHelper.incrementDays(new Date(firstBuy.date), 1)
    );

    return this.getAssetDailyProfitability(adjustedBuysSells, filteredAssetHistoricalPrices);
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
    buysSells: BuySell[],
    assetHistoricalPrices: AssetHistoricalPrice[]
  ): AssetProfitability {
    const timestamps: number[] = [];
    const values: number[] = [];

    assetHistoricalPrices.forEach((assetHistoricalPrice) => {
      const buysSellsOnAssetHistoricalPriceDate = buysSells.filter(
        (buySell) => new Date(buySell.date).getTime() <= new Date(assetHistoricalPrice.date).getTime()
      );
      let assetQuantityOnAssetHistoricalPriceDate: number = 0;
      let assetCostOnAssetHistoricalPriceDate: number = 0;

      buysSellsOnAssetHistoricalPriceDate.forEach((buySell) => {
        buySell.type === BuySellTypes.Buy
          ? (assetQuantityOnAssetHistoricalPriceDate += buySell.quantity)
          : (assetQuantityOnAssetHistoricalPriceDate -= buySell.quantity);

        if (buySell.type === BuySellTypes.Buy) {
          assetCostOnAssetHistoricalPriceDate += buySell.quantity * buySell.price;
        }
      });

      const portfolioAssetValue = assetHistoricalPrice.closingPrice * assetQuantityOnAssetHistoricalPriceDate;
      const profitability = portfolioAssetValue - assetCostOnAssetHistoricalPriceDate;
      const profitabilityInPercentage = Number(
        ((profitability / assetCostOnAssetHistoricalPriceDate) * 100).toFixed(2)
      );

      timestamps.push(new Date(assetHistoricalPrice.date).getTime());
      values.push(profitabilityInPercentage);
    });

    return { timestamps, values };
  }
}
