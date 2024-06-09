import { Injectable } from '@nestjs/common';

import { BuysSellsService } from '../buysSells/buysSells.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';

@Injectable()
export class ProfitabilitiesService {
  constructor(
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly buysSellsService: BuysSellsService
  ) {}

  public async getPortfolioAssetProfitability(assetId: number, portfolioId: number) {
    const portfolioAsset = await this.portfoliosAssetsService.find(assetId, portfolioId, true);
    const { data } = await this.buysSellsService.get({ assetId, portfolioId, limit: '1' });
    const firstBuy = data[0];

    return portfolioAsset;
  }
}
