import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { MarketDataProviderService, AssetPrice } from '../marketDataProvider/marketDataProvider.service';
import { Asset, AssetCategories, AssetClasses } from '../assets/asset.entity';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { FilesService } from '../files/files.service';
import { DateHelper } from '../common/helpers/date.helper';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { GetRequestResponse } from '../common/dto/request';
import {
  AssetHistoricalPriceCsvRow,
  FindAssetHistoricalPriceDto,
  GetAssetHistoricalPricesDto
} from './assetHistoricalPrices.dto';
import { Currencies } from '../common/enums/number';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { MarketIndexesService } from '../marketIndexes/marketIndexes.service';
import { normalizePaginationParams } from '../common/helpers/request.helper';

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);

  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPricesRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly marketIndexesService: MarketIndexesService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService,
    private readonly filesService: FilesService,
    private readonly dateHelper: DateHelper,
    private readonly currencyHelper: CurrencyHelper
  ) {}

  public async importPrices(
    asset: Asset,
    file: Express.Multer.File,
    manager: EntityManager,
    fromDate?: string
  ): Promise<AssetHistoricalPrice[]> {
    const fileContent = await this.filesService.readCsvFile<AssetHistoricalPriceCsvRow>(file);
    const assetPrices: AssetPrice[] = [];

    for (const assetPriceRow of fileContent) {
      const { date, price } = assetPriceRow;

      if (!fromDate || new Date(date).getTime() >= new Date(fromDate).getTime()) {
        const parsedPrice = this.currencyHelper.parse(price);
        const parsedDate = new Date(date);
        assetPrices.push({
          date: parsedDate.getTime(),
          close: parsedPrice
        });
      }
    }

    return await this.create(asset, assetPrices, manager);
  }

  public async syncPrices(assetId: number, manager?: EntityManager): Promise<AssetHistoricalPrice[]> {
    const asset = await this.assetsRepository.findOne({ where: { id: assetId } });
    const [latestPrice] = await this.getMostRecent([asset.id]);
    const assetHistoricalPrices: AssetHistoricalPrice[] = [];

    if (asset.category === AssetCategories.VariableIncome) {
      const mappedAssetCode = asset.class === AssetClasses.Cryptocurrency ? `${asset.code}-USD` : asset.code;
      const fullAssetCode = asset.currency === Currencies.BRL ? `${mappedAssetCode}.SA` : mappedAssetCode;
      const assetData = await this.marketDataProviderService.getAssetHistoricalData(
        fullAssetCode,
        latestPrice ? this.dateHelper.incrementDays(new Date(latestPrice.date), 1) : undefined,
        true
      );

      const newPrices = await this.create(asset, assetData.prices, manager);

      assetHistoricalPrices.push(...newPrices);
    } else {
      if (asset.index) {
        const generateFromDate = this.dateHelper.format(
          this.dateHelper.addDays(new Date(latestPrice.date), 1),
          'yyyy-MM-dd'
        );
        const newPrices = await this.generatePrices(asset, manager, generateFromDate, latestPrice);

        assetHistoricalPrices.push(...newPrices);
      }
    }

    return assetHistoricalPrices;
  }

  public async generatePrices(
    asset: Asset,
    manager?: EntityManager,
    startDate?: string,
    latestPrice?: AssetHistoricalPrice
  ): Promise<AssetHistoricalPrice[]> {
    const marketIndex = await this.marketIndexesService.find({ code: asset.index });
    const marketIndexHistoricalData = await this.marketIndexHistoricalDataService.get({
      marketIndexId: marketIndex.id,
      from: startDate,
      orderByColumn: 'date'
    });
    const assetPrices: AssetPrice[] = [];
    let price = latestPrice?.closingPrice || 1;

    for (const indexData of marketIndexHistoricalData.data) {
      const indexDailyRate = indexData.value;
      const parsedIndexDate = new Date(indexData.date);

      parsedIndexDate.setUTCHours(0, 0, 0, 0);

      price *= 1 + indexDailyRate * asset.rate;

      assetPrices.push({
        date: parsedIndexDate.getTime(),
        close: price
      });
    }

    return await this.create(asset, assetPrices, manager);
  }

  public async create(
    asset: Asset,
    assetPrices: AssetPrice[],
    manager?: EntityManager
  ): Promise<AssetHistoricalPrice[]> {
    const assetHistoricalPrices = assetPrices.map(
      (assetPrice) =>
        new AssetHistoricalPrice(
          asset.id,
          this.dateHelper.format(new Date(assetPrice.date), 'yyyy-MM-dd'),
          assetPrice.close
        )
    );

    if (manager) {
      await manager.save(assetHistoricalPrices);
    } else {
      await this.assetHistoricalPricesRepository.save(assetHistoricalPrices);
    }

    return assetHistoricalPrices;
  }

  public async get(
    getAssetHistoricalPricesDto?: GetAssetHistoricalPricesDto
  ): Promise<GetRequestResponse<AssetHistoricalPrice>> {
    const { page, limit, orderByColumn, orderBy } = normalizePaginationParams(
      getAssetHistoricalPricesDto || {},
      'assetHistoricalPrice',
      'assetId'
    );
    const builder = this.assetHistoricalPricesRepository.createQueryBuilder('assetHistoricalPrice');

    if (getAssetHistoricalPricesDto?.assetIds?.length) {
      builder.andWhere({ assetId: In(getAssetHistoricalPricesDto.assetIds) });
    }

    if (getAssetHistoricalPricesDto?.from) {
      builder.andWhere({ date: MoreThanOrEqual(getAssetHistoricalPricesDto?.from) });
    }

    if (getAssetHistoricalPricesDto?.to) {
      builder.andWhere({ date: LessThanOrEqual(getAssetHistoricalPricesDto?.to) });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    builder.orderBy(orderByColumn, orderBy);

    const assetHistoricalPrices = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: assetHistoricalPrices,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async find(findAssetHistoricalPriceDto: FindAssetHistoricalPriceDto): Promise<AssetHistoricalPrice> {
    const { assetId, date } = findAssetHistoricalPriceDto;
    const builder = this.assetHistoricalPricesRepository.createQueryBuilder('assetHistoricalPrices');

    if (assetId) {
      builder.andWhere({ assetId });
    }

    if (date) {
      builder.andWhere({ date });
    }

    const assetHistoricalPrice = await builder.getOne();

    if (!assetHistoricalPrice) {
      throw new NotFoundException('Asset historical price not found');
    }

    return assetHistoricalPrice;
  }

  public async getMostRecent(assetIds: number[], date?: string): Promise<AssetHistoricalPrice[]> {
    const builder = this.assetHistoricalPricesRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      })
      .where('assetHistoricalPrice.assetId IN (:...assetIds)', { assetIds });

    if (date) {
      builder.andWhere({ date });
    }

    return await builder.getMany();
  }

  public async delete(assetId: number): Promise<void> {
    await this.assetHistoricalPricesRepository.delete({ assetId });
  }
}
