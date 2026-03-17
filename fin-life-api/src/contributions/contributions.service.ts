import { Injectable } from '@nestjs/common';

import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { Contribution, GetContributionsDto } from './contributions.dto';
import { Currencies } from '../common/enums/number';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { MarketIndexesService } from '../marketIndexes/marketIndexes.service';
import { MarketIndex } from '../marketIndexes/marketIndex.entity';

type GroupsPortfolioDataMap = Map<string, PortfolioData>;

interface PortfolioData {
  currentValue: number;
  contribution: number;
  expectedValue: number;
}

@Injectable()
export class ContributionsService {
  constructor(
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly marketIndexesService: MarketIndexesService
  ) {}

  public async get(portfolioId: number, getContributionsDto: GetContributionsDto): Promise<Contribution[]> {
    const { data: portfoliosAssets } = await this.portfoliosAssetsService.get({ portfolioId, open: true });
    const marketIndex = await this.marketIndexesService.find({ code: 'USD/BRL' });
    const latestFxRate = marketIndex.marketIndexHistoricalData[0].value;
    const groupsPortfolioDataMap = this.groupPortfolioData(
      portfoliosAssets,
      getContributionsDto,
      marketIndex,
      latestFxRate
    );
    const mappedContributions = this.mapContributions(
      portfoliosAssets,
      getContributionsDto,
      groupsPortfolioDataMap,
      latestFxRate
    );

    return mappedContributions;

    // return contributionsSortedByGroupContribution.sort(this.sortContributionsByHigherMinContributionWithinTheGroup);
  }

  private groupPortfolioData(
    portfoliosAssets: PortfolioAsset[],
    getContributionsDto: GetContributionsDto,
    marketIndex: MarketIndex,
    latestFxRate: number
  ): GroupsPortfolioDataMap {
    const groupsPortfolioDataMap: GroupsPortfolioDataMap = new Map([]);
    const portfolioValue = this.portfoliosAssetsService.getAssetsCurrentValue(portfoliosAssets, undefined, marketIndex);

    portfoliosAssets.forEach((portfolioAsset) => {
      const groupBy = portfolioAsset.asset[getContributionsDto.groupBy] || 'Portfolio';
      const groupCurrentValue = this.calculateGroupCurrentValue(
        portfolioAsset,
        groupsPortfolioDataMap,
        groupBy,
        latestFxRate
      );
      const groupContribution = this.calculateGroupContribution(
        getContributionsDto,
        groupBy,
        portfolioValue,
        groupCurrentValue
      );

      groupsPortfolioDataMap.set(groupBy, {
        currentValue: groupCurrentValue,
        contribution: groupContribution > 0 ? groupContribution : 0,
        expectedValue: groupCurrentValue + groupContribution
      });
    });

    return this.sortPortfolioDataByContribution(groupsPortfolioDataMap);
  }

  private calculateGroupCurrentValue(
    portfolioAsset: PortfolioAsset,
    groupsPortfolioDataMap: GroupsPortfolioDataMap,
    groupBy: string,
    latestFxRate: number
  ): number {
    const assetLatestPrice = portfolioAsset.asset.assetHistoricalPrices[0];
    const groupData = groupsPortfolioDataMap.get(groupBy);
    let portfolioAssetValue = portfolioAsset.quantity * assetLatestPrice.closingPrice;

    if (portfolioAsset.asset.currency === Currencies.USD) {
      portfolioAssetValue *= latestFxRate;
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

    return contribution;
  }

  private sortPortfolioDataByContribution(groupsPortfolioDataMap: GroupsPortfolioDataMap): GroupsPortfolioDataMap {
    return new Map(
      [...groupsPortfolioDataMap.entries()].sort((a, b) => (a[1].contribution > b[1].contribution ? -1 : 1))
    );
  }

  private mapContributions(
    portfoliosAssets: PortfolioAsset[],
    getContributionsDto: GetContributionsDto,
    groupsPortfolioDataMap: GroupsPortfolioDataMap,
    latestFxRate: number
  ): Contribution[] {
    const { groupBy } = getContributionsDto;
    const contributions: Contribution[] = [];

    groupsPortfolioDataMap.forEach((groupData, group) => {
      contributions.push({
        group: group,
        contribution: groupData.contribution,
        currentValue: groupData.currentValue,
        expectedValue: groupData.expectedValue,
        expectedPercentage:
          getContributionsDto.targetPercentages?.find((targetPercentage) => targetPercentage.label === group)
            ?.percentage || 1,
        assets: portfoliosAssets
          .map((portfolioAsset) => {
            if (!groupBy || portfolioAsset.asset?.[groupBy] === group) {
              const { asset, minPercentage, maxPercentage } = portfolioAsset;
              const groupValueAfterContribution = groupData.currentValue + groupData.contribution;
              const assetLatestPrice = asset.assetHistoricalPrices[0];
              let portfolioAssetValue = portfolioAsset.quantity * assetLatestPrice.closingPrice;
              if (asset.currency === Currencies.USD) {
                portfolioAssetValue *= latestFxRate;
              }
              return {
                description: `${portfolioAsset.asset.code} - ${portfolioAsset.asset.name}`,
                currentValue: portfolioAssetValue,
                minContribution: minPercentage * groupValueAfterContribution - portfolioAssetValue,
                minPercentage: portfolioAsset.minPercentage,
                maxContribution: maxPercentage * groupValueAfterContribution - portfolioAssetValue,
                maxPercentage: portfolioAsset.maxPercentage,
                portfolioAssetId: portfolioAsset.id
              };
            }
          })
          .filter(Boolean)
          .sort((a, b) => (a.minContribution > b.minContribution ? -1 : 1))
      });
    });

    return contributions;
  }
}
