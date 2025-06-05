import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Asset } from './asset.entity';
import { CreateAssetDto, UpdateAssetDto } from './assets.dto';
import { AssetData, MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { DividendHistoricalPaymentsService } from '../dividendHistoricalPayments/dividendHistoricalPayments.service';
import { SplitHistoricalEventsService } from '../splitHistoricalEvents/splitHistoricalEvents.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';

export interface GetAssetsDto {
  tickers?: string[];
  active?: string;
  relations?: string[];
}
export interface FindAssetParams {
  relations?: string[];
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly dividendHistoricalPaymentsService: DividendHistoricalPaymentsService,
    private readonly splitHistoricalEventsService: SplitHistoricalEventsService
  ) {}

  public async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { ticker, category, assetClass, sector, currency } = createAssetDto;

    await this.checkIfAssetAlreadyExists(ticker);

    return await this.assetsRepository.manager.transaction(async (manager) => {
      const assetData = await this.marketDataProviderService.getAssetHistoricalData(`${ticker}.SA`, undefined, true);
      const asset = new Asset(ticker.toUpperCase(), category, assetClass, sector, currency);

      await manager.save(asset);
      await this.dividendHistoricalPaymentsService.create(asset, assetData.dividends, manager);
      await this.splitHistoricalEventsService.create(asset, assetData.splits, manager);

      const assetHistoricalPrices = await this.assetHistoricalPricesService.create(asset, assetData.prices, manager);
      const allTimeHighPrice = this.findAllTimeHighPrice(assetHistoricalPrices);

      asset.allTimeHighPrice = allTimeHighPrice;

      await manager.save(asset);

      return asset;
    });
  }

  public async get(getAssetsDto?: GetAssetsDto): Promise<Asset[]> {
    const { tickers, active, relations } = getAssetsDto || {};
    const builder = this.assetsRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrice',
        'assetHistoricalPrice.id = (' +
          this.assetsRepository
            .createQueryBuilder('assetHistoricalPriceSubQuery')
            .subQuery()
            .select('assetHistoricalPriceSubQuery.id')
            .from('asset_historical_prices', 'assetHistoricalPriceSubQuery')
            .where('assetHistoricalPriceSubQuery.asset_id = asset.id')
            .orderBy('assetHistoricalPriceSubQuery.date', 'DESC')
            .limit(1)
            .getQuery() +
          ')'
      );

    if (relations) {
      (Array.isArray(relations) ? relations : [relations]).forEach((relation) => {
        builder.leftJoinAndSelect(`asset.${relation}`, relation.slice(0, relation.length - 1));
      });
    }

    if (tickers) {
      builder.where('asset.ticker IN (:...tickers)', { tickers: Array.isArray(tickers) ? tickers : [tickers] });
    }

    if (active !== undefined) {
      builder.andWhere('asset.active = :status', { status: active });
    }

    return await builder.orderBy('asset.class', 'ASC').addOrderBy('asset.ticker', 'ASC').getMany();
  }

  public async update(assetId: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.find(assetId);
    const updatedAsset = this.assetsRepository.merge(Object.assign({}, asset), updateAssetDto);

    await this.assetsRepository.save(updatedAsset);

    return updatedAsset;
  }

  public async syncPrices(assetId: number): Promise<Asset> {
    return await this.assetsRepository.manager.transaction(async (manager) => {
      const asset = await this.find(assetId);
      const assetHistoricalPrices = await this.assetHistoricalPricesService.syncPrices(assetId, manager);
      const highestPriceAmongNewPrices = this.findAllTimeHighPrice(assetHistoricalPrices);

      if (highestPriceAmongNewPrices > asset.allTimeHighPrice) {
        asset.allTimeHighPrice = highestPriceAmongNewPrices;

        await manager.save(asset);
      }

      asset.assetHistoricalPrices = assetHistoricalPrices;

      return asset;
    });
  }

  public async find(assetId: number, params?: FindAssetParams): Promise<Asset> {
    const { relations } = params || {};
    const asset = await this.assetsRepository.findOne({
      where: { id: assetId },
      relations: relations ? (Array.isArray(relations) ? relations : [relations]) : []
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  private async checkIfAssetAlreadyExists(ticker: string): Promise<void> {
    const asset = await this.assetsRepository.findOne({ where: { ticker: ticker.toUpperCase() } });

    if (asset) {
      throw new ConflictException('Asset already exists');
    }
  }

  private findAllTimeHighPrice(assetHistoricalPrices: AssetHistoricalPrice[]): number {
    let allTimeHighPrice = 0;

    assetHistoricalPrices.forEach((assetHistoricalPrice) => {
      if (assetHistoricalPrice.closingPrice > allTimeHighPrice) {
        allTimeHighPrice = assetHistoricalPrice.closingPrice;
      }
    });

    return allTimeHighPrice;
  }
}
