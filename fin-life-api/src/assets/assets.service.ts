import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In, Repository } from 'typeorm';

import { Asset, AssetCategories, AssetClasses } from './asset.entity';
import { CreateAssetDto, FindAssetDto, GetAssetsDto, UpdateAssetDto } from './assets.dto';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { DividendHistoricalPaymentsService } from '../dividendHistoricalPayments/dividendHistoricalPayments.service';
import { SplitHistoricalEventsService } from '../splitHistoricalEvents/splitHistoricalEvents.service';
import { AssetHistoricalPrice } from '../assetHistoricalPrices/assetHistoricalPrice.entity';
import { GetRequestResponse } from '../common/dto/request';
import { Currencies } from '../common/enums/number';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly eventEmitter: EventEmitter2,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly dividendHistoricalPaymentsService: DividendHistoricalPaymentsService,
    private readonly splitHistoricalEventsService: SplitHistoricalEventsService
  ) {}

  public async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { name, code, category, assetClass, sector, currency, startDate, rate, index } = createAssetDto;

    await this.checkIfAssetAlreadyExists(code);

    return await this.assetsRepository.manager.transaction(async (manager) => {
      const mappedAssetCode = assetClass === AssetClasses.Cryptocurrency ? `${code}-USD` : code;
      const assetFullCode =
        assetClass === AssetClasses.Stock && currency === Currencies.BRL ? `${mappedAssetCode}.SA` : mappedAssetCode;
      const asset = new Asset(name, code.toUpperCase(), category, assetClass, currency, sector, startDate, rate, index);

      await manager.save(asset);

      if (asset.class !== AssetClasses.Cash) {
        const assetData = await this.marketDataProviderService.getAssetHistoricalData(assetFullCode, undefined, true);

        await this.dividendHistoricalPaymentsService.create(asset, assetData.dividends, manager);
        await this.splitHistoricalEventsService.create(asset, assetData.splits, manager);

        const assetHistoricalPrices = await this.assetHistoricalPricesService.create(asset, assetData.prices, manager);
        const allTimeHighPrice = this.findAllTimeHighPrice(assetHistoricalPrices);

        asset.allTimeHighPrice = allTimeHighPrice;

        await manager.save(asset);

        asset.assetHistoricalPrices = [assetHistoricalPrices[assetHistoricalPrices.length - 1]];
      }

      if (asset.rate && asset.index) {
        const assetHistoricalPrices = await this.assetHistoricalPricesService.generatePrices(asset, manager, startDate);

        asset.allTimeHighPrice = assetHistoricalPrices[assetHistoricalPrices.length - 1].closingPrice;

        await manager.save(asset);

        asset.assetHistoricalPrices = [assetHistoricalPrices[assetHistoricalPrices.length - 1]];
      }

      return asset;
    });
  }

  public async importPrices(assetId: number, file: Express.Multer.File): Promise<Asset> {
    this.logger.log(`[importPrices] Importing prices for asset ${assetId}...`);

    const asset = await this.find(assetId);

    await this.assetsRepository.manager.transaction(async (manager) => {
      const assetHistoricalPrices = await this.assetHistoricalPricesService.importPrices(asset, file, manager);

      if (assetHistoricalPrices.length) {
        const highestPriceAmongNewPrices = this.findAllTimeHighPrice(assetHistoricalPrices);

        if (highestPriceAmongNewPrices > asset.allTimeHighPrice) {
          asset.allTimeHighPrice = highestPriceAmongNewPrices;

          await manager.save(asset);
        }

        asset.assetHistoricalPrices = assetHistoricalPrices;
      }
    });

    return asset;
  }

  public async syncPrices(assetId?: number): Promise<Asset[]> {
    this.logger.log(`[syncPrices] Synchronizing asset prices...`);

    const assetsToSync = await this.getAssetsToSync(assetId);

    this.logger.log(`[syncPrices] ${assetsToSync.length} assets found`);

    for (const asset of assetsToSync) {
      try {
        this.logger.log(`[syncPrices] Synchronizing prices for asset ${asset.id}`);

        await this.assetsRepository.manager.transaction(async (manager) => {
          const assetHistoricalPrices = await this.assetHistoricalPricesService.syncPrices(asset.id, manager);

          this.logger.log(`[syncPrices] ${assetHistoricalPrices.length} prices found to be synchronized`);

          if (assetHistoricalPrices.length) {
            const highestPriceAmongNewPrices = this.findAllTimeHighPrice(assetHistoricalPrices);

            if (highestPriceAmongNewPrices > asset.allTimeHighPrice) {
              asset.allTimeHighPrice = highestPriceAmongNewPrices;
              asset.assetHistoricalPrices = undefined;

              await manager.save(asset);
            }

            if (assetHistoricalPrices.length) {
              asset.assetHistoricalPrices = assetHistoricalPrices;
            }
          }

          this.logger.log(`[syncPrices] Prices for asset ${asset.id} successfully synchronized`);
        });
      } catch (error) {
        this.logger.error(`[syncPrices] Error when synchronizing prices for asset ${asset.id}: ${error.message}`);
      }
    }

    this.logger.log('[syncPrices] Asset prices successfully synchronized');

    return assetsToSync;
  }

  public async syncSplits(assetId: number): Promise<Asset> {
    this.logger.log(`[syncSplits] Synchronizing splits for asset ${assetId}...`);

    const asset = await this.find(assetId, {
      classes: [AssetClasses.Stock, AssetClasses.RealState, AssetClasses.International],
      relations: ['splitHistoricalEvents']
    });

    if (asset.splitHistoricalEvents.length) {
      const newSplitHistoricalEvents = await this.splitHistoricalEventsService.syncSplits(asset);

      asset.splitHistoricalEvents.push(...newSplitHistoricalEvents);
      this.eventEmitter.emit('splits.synchronized', asset, newSplitHistoricalEvents);
    }

    return asset;
  }

  public async get(getAssetsDto?: GetAssetsDto): Promise<GetRequestResponse<Asset>> {
    const { id, codes, active, relations } = getAssetsDto || {};
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
      .orderBy('asset.code');

    if (relations?.length) {
      (Array.isArray(relations) ? relations : [relations]).forEach((relation) => {
        builder.leftJoinAndSelect(`asset.${relation}`, relation.slice(0, relation.length - 1));
      });
    }

    if (id) {
      builder.andWhere('asset.id = :id', { id });
    }

    if (codes?.length) {
      builder.andWhere('asset.code IN (:...codes)', { codes: Array.isArray(codes) ? codes : [codes] });
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

  public async delete(assetId: number): Promise<void> {
    const asset = await this.find(assetId);

    await this.assetsRepository.delete(asset);
  }

  public async find(assetId: number, findAssetDto?: FindAssetDto): Promise<Asset> {
    this.logger.log(`[find] Finding asset ${assetId}...`);

    const { relations, withLastPrice, active, category, classes } = findAssetDto || {};
    const builder = this.assetsRepository.createQueryBuilder('asset').where('asset.id = :assetId', { assetId });

    if (active) {
      builder.andWhere({ active });
    }

    if (category) {
      builder.andWhere({ category });
    }

    if (classes) {
      builder.andWhere({ class: In(classes) });
    }

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

    this.logger.log(`[find] Asset ${asset.code} found`);

    return asset;
  }

  private async checkIfAssetAlreadyExists(code: string): Promise<void> {
    const asset = await this.assetsRepository.findOne({ where: { code: code.toUpperCase() } });

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

  private async getAssetsToSync(assetId?: number): Promise<Asset[]> {
    const assetsToSync: Asset[] = [];

    if (assetId) {
      this.logger.log(`[getAssetsToSync] Getting asset ${assetId} to sync...`);

      const asset = await this.find(assetId, {
        withLastPrice: 'true',
        active: true,
        category: AssetCategories.VariableIncome // Remove after taking fixed income into account when synchronizing prices
      });

      assetsToSync.push(asset);
    } else {
      this.logger.log('[getAssetsToSync] Getting assets to sync...');

      const assets = await this.assetsRepository.find({
        where: {
          active: true,
          category: AssetCategories.VariableIncome // Remove after taking fixed income into account when synchronizing prices
        }
      });

      for (const asset of assets) {
        const assetToSync = await this.find(asset.id, { withLastPrice: 'true' });

        assetsToSync.push(assetToSync);
      }
    }

    return assetsToSync;
  }
}
