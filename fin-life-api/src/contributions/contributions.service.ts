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
    const contributionsSortedByGroupContribution = this.sortContributionsByHigherGroupContribution(
      mappedContributions,
      groupsPortfolioDataMap
    );

    return contributionsSortedByGroupContribution.sort(this.sortContributionsByHigherMinContributionWithinTheGroup);
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

      groupsPortfolioDataMap.set(groupBy, {
        currentValue: groupCurrentValue,
        contribution: this.calculateGroupContribution(getContributionsDto, groupBy, portfolioValue, groupCurrentValue)
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

    return contribution > 0 ? contribution : 0;
  }

  private sortPortfolioDataByContribution(groupsPortfolioDataMap: GroupsPortfolioDataMap): GroupsPortfolioDataMap {
    return new Map([...groupsPortfolioDataMap.entries()].sort((a, b) => a[1].contribution - b[1].contribution));
  }

  private mapContributions(
    portfoliosAssets: PortfolioAsset[],
    getContributionsDto: GetContributionsDto,
    groupsPortfolioDataMap: GroupsPortfolioDataMap,
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
        group: groupBy,
        assetCurrentValue: portfolioAssetValue,
        minContribution: minPercentage * groupValueAfterContribution - portfolioAssetValue,
        minPercentage: portfolioAsset.minPercentage,
        maxContribution: maxPercentage * groupValueAfterContribution - portfolioAssetValue,
        maxPercentage: portfolioAsset.maxPercentage,
        portfolioAssetId: portfolioAsset.id
      };
    });
  }

  private sortContributionsByHigherGroupContribution(
    contributions: Contribution[],
    groupsPortfolioDataMap: GroupsPortfolioDataMap
  ): Contribution[] {
    return contributions.sort((a, b) => {
      const firstContributionGroup = groupsPortfolioDataMap.get(a.group);
      const secondContributionGroup = groupsPortfolioDataMap.get(b.group);

      return firstContributionGroup.contribution < secondContributionGroup.contribution ? 1 : -1;
    });
  }

  private sortContributionsByHigherMinContributionWithinTheGroup(
    contributionA: Contribution,
    contributionB: Contribution
  ): number {
    if (contributionA.group !== contributionB.group) {
      return 0;
    } else {
      return contributionA.minContribution > contributionB.minContribution ? -1 : 1;
    }
  }

  // private sortContributionByHigherMinContribution(contributionA: Contribution, contributionB: Contribution): number {
  //   return contributionA.minContribution < contributionB.minContribution ? 1 : -1;
  // }
}
