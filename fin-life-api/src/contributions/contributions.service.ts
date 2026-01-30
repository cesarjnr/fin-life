import { Injectable } from '@nestjs/common';

import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { Contribution, GetContributionsDto } from './contributions.dto';
import { Currencies } from '../common/enums/number';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';

type GroupsPortfolioData = Map<string, PortfolioData>;

interface PortfolioData {
  currentValue: number;
  contribution: number;
}

@Injectable()
export class ContributionsService {
  constructor(
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async get(portfolioId: number, getContributionsDto: GetContributionsDto): Promise<Contribution[]> {
    const { data: portfoliosAssets } = await this.portfoliosAssetsService.get({ portfolioId, open: true });
    const latestFxRate = await this.marketIndexHistoricalDataService.getMostRecent('USD/BRL');
    const groupsPortfolioDataMap = this.groupPortfolioData(portfoliosAssets, getContributionsDto, latestFxRate);

    return this.mapContributions(portfoliosAssets, getContributionsDto, groupsPortfolioDataMap, latestFxRate.value);
  }

  private groupPortfolioData(
    portfoliosAssets: PortfolioAsset[],
    getContributionsDto: GetContributionsDto,
    latestFxRate: MarketIndexHistoricalData
  ): GroupsPortfolioData {
    const groupsPortfolioDataMap: GroupsPortfolioData = new Map([]);
    const portfolioValue = this.portfoliosAssetsService.getAssetsCurrentValue(
      portfoliosAssets,
      undefined,
      latestFxRate
    );

    portfoliosAssets.forEach((portfolioAsset) => {
      const groupBy = portfolioAsset.asset[getContributionsDto.groupBy] || 'Portfolio';
      const groupCurrentValue = this.calculateGroupCurrentValue(
        portfolioAsset,
        groupsPortfolioDataMap,
        groupBy,
        latestFxRate
      );

      groupsPortfolioDataMap.set(groupBy, {
        currentValue: groupCurrentValue,
        contribution: this.calculateGroupContribution(getContributionsDto, groupBy, portfolioValue, groupCurrentValue)
      });
    });

    return groupsPortfolioDataMap;
  }

  private calculateGroupCurrentValue(
    portfolioAsset: PortfolioAsset,
    groupsPortfolioDataMap: GroupsPortfolioData,
    groupBy: string,
    latestFxRate: MarketIndexHistoricalData
  ): number {
    const assetLatestPrice = portfolioAsset.asset.assetHistoricalPrices[0];
    const groupData = groupsPortfolioDataMap.get(groupBy);
    let portfolioAssetValue = portfolioAsset.quantity * assetLatestPrice.closingPrice;

    if (portfolioAsset.asset.currency === Currencies.USD) {
      portfolioAssetValue *= latestFxRate.value;
    }

    return portfolioAssetValue + (groupData?.currentValue || 0);
  }

  private calculateGroupContribution(
    getContributionsDto: GetContributionsDto,
    groupBy: string,
    portfolioValue: number,
    groupCurrentValue: number
  ): number {
    const targetPercentage = getContributionsDto.targetPercentages?.find(
      (targetPercentage) => targetPercentage.label === groupBy
    );
    const porfolioValueAfterContribution = portfolioValue + (getContributionsDto.monthContribution || 0);
    const contribution = (targetPercentage?.percentage || 1) * porfolioValueAfterContribution - groupCurrentValue;

    return contribution > 0 ? contribution : 0;
  }

  private mapContributions(
    portfoliosAssets: PortfolioAsset[],
    getContributionsDto: GetContributionsDto,
    groupsPortfolioDataMap: GroupsPortfolioData,
    latestFxRate: number
  ): Contribution[] {
    return portfoliosAssets.map((portfolioAsset) => {
      const { asset, minPercentage, maxPercentage } = portfolioAsset;
      const groupBy = asset[getContributionsDto.groupBy] || 'Portfolio';
      const groupData = groupsPortfolioDataMap.get(groupBy);
      const groupValueAfterContribution = groupData.currentValue + groupData.contribution;
      const assetLatestPrice = asset.assetHistoricalPrices[0];
      let portfolioAssetValue = portfolioAsset.quantity * assetLatestPrice.closingPrice;

      if (asset.currency === Currencies.USD) {
        portfolioAssetValue *= latestFxRate;
      }

      return {
        asset: `${portfolioAsset.asset.code} - ${portfolioAsset.asset.name}`,
        assetCurrentValue: portfolioAssetValue,
        minContribution: minPercentage * groupValueAfterContribution - portfolioAssetValue,
        minPercentage: portfolioAsset.minPercentage,
        maxContribution: maxPercentage * groupValueAfterContribution - portfolioAssetValue,
        maxPercentage: portfolioAsset.maxPercentage,
        portfolioAssetId: portfolioAsset.id
      };
    });
  }
}
