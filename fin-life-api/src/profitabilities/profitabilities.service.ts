import { Injectable } from '@nestjs/common';

import { BuysSellsService } from '../buysSells/buysSells.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';

export interface AssetProfitability {
  timestamps: number[];
  values: number[];
}

@Injectable()
export class ProfitabilitiesService {
  constructor(
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly buysSellsService: BuysSellsService
  ) {}

  public async getPortfolioAssetProfitability(assetId: number, portfolioId: number): Promise<AssetProfitability> {
    const portfolioAsset = await this.portfoliosAssetsService.find({ assetId, portfolioId, withAllAssetPrices: true });
    const { data } = await this.buysSellsService.get({ assetId, portfolioId, limit: '1' });
    const firstBuy = data[0];
    const filteredAssetHistoricalPrices = this.filterAssetHistoricalPricesFromDate(
      portfolioAsset.asset.assetHistoricalPrices,
      new Date(firstBuy.date)
    );

    return this.getAssetDailyProfitability(portfolioAsset, filteredAssetHistoricalPrices);
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
    portfolioAsset: PortfolioAsset,
    assetHistoricalPrices: AssetHistoricalPrice[]
  ): AssetProfitability {
    const timestamps: number[] = [];
    const values: number[] = [];

    assetHistoricalPrices.forEach((assetHistoricalPrice) => {
      const portfoliAssetValue = assetHistoricalPrice.closingPrice * portfolioAsset.quantity;
      const profitability = portfoliAssetValue - portfolioAsset.adjustedCost;
      const profitabilityInPercentage = Number((profitability / portfolioAsset.adjustedCost).toFixed(2));

      timestamps.push(new Date(assetHistoricalPrice.date).getTime());
      values.push(profitabilityInPercentage);
    });

    return { timestamps, values };
  }
}
