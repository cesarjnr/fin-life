import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Asset } from './asset.entity';
import { CreateAssetDto, FindAssetDto, GetAssetsDto, UpdateAssetDto } from './assets.dto';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { DividendHistoricalPaymentsService } from '../dividendHistoricalPayments/dividendHistoricalPayments.service';
import { SplitHistoricalEventsService } from '../splitHistoricalEvents/splitHistoricalEvents.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { GetRequestResponse } from '../common/dto/request';

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

      asset.assetHistoricalPrices = [assetHistoricalPrices[assetHistoricalPrices.length - 1]];

      return asset;
    });
  }

  public async get(getAssetsDto?: GetAssetsDto): Promise<GetRequestResponse<Asset>> {
    const { id, tickers, active, relations } = getAssetsDto || {};
    const page: number | null = getAssetsDto?.page ? Number(getAssetsDto.page) : null;
    const limit: number | null = getAssetsDto?.limit && getAssetsDto.limit !== '0' ? Number(getAssetsDto.limit) : null;
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
      )
      .orderBy('asset.ticker');

    if (relations) {
      (Array.isArray(relations) ? relations : [relations]).forEach((relation) => {
        builder.leftJoinAndSelect(`asset.${relation}`, relation.slice(0, relation.length - 1));
      });
    }

    if (id) {
      builder.andWhere('asset.id = :id', { id });
    }

    if (tickers) {
      builder.andWhere('asset.ticker IN (:...tickers)', { tickers: Array.isArray(tickers) ? tickers : [tickers] });
    }

    if (active !== undefined) {
      builder.andWhere('asset.active = :status', { status: active });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const assets = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: assets,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async update(assetId: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.find(assetId, { withLastPrice: 'true' });
    const [lastPrice] = asset.assetHistoricalPrices;

    asset.assetHistoricalPrices = undefined;

    const updatedAsset = this.assetsRepository.merge(Object.assign({}, asset), updateAssetDto);

    await this.assetsRepository.save(updatedAsset);

    updatedAsset.assetHistoricalPrices = lastPrice ? [lastPrice] : [];

    return updatedAsset;
  }

  public async syncPrices(assetId: number): Promise<Asset> {
    return await this.assetsRepository.manager.transaction(async (manager) => {
      const asset = await this.find(assetId, { withLastPrice: 'true' });
      const assetHistoricalPrices = await this.assetHistoricalPricesService.syncPrices(assetId, manager);
      const highestPriceAmongNewPrices = this.findAllTimeHighPrice(assetHistoricalPrices);

      if (highestPriceAmongNewPrices > asset.allTimeHighPrice) {
        asset.allTimeHighPrice = highestPriceAmongNewPrices;
        asset.assetHistoricalPrices = undefined;

        await manager.save(asset);
      }

      if (assetHistoricalPrices.length) {
        asset.assetHistoricalPrices = assetHistoricalPrices;
      }

      return asset;
    });
  }

  public async find(assetId: number, findAssetDto?: FindAssetDto): Promise<Asset> {
    const { relations, withLastPrice } = findAssetDto || {};
    const builder = this.assetsRepository.createQueryBuilder('asset').where('asset.id = :assetId', { assetId });

    if (relations) {
      (Array.isArray(relations) ? relations : [relations]).forEach((relation) => {
        builder.leftJoinAndSelect(`asset.${relation}`, relation.slice(0, relation.length - 1));
      });
    }

    if (withLastPrice == 'true') {
      builder.leftJoinAndSelect(
        'asset.assetHistoricalPrices',
        'assetHistoricalPrices',
        `assetHistoricalPrices.id = (
        SELECT id FROM asset_historical_prices
          WHERE asset_id = asset.id
          ORDER BY date DESC
          LIMIT 1
        )`
      );
    }

    const asset = await builder.getOne();

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
