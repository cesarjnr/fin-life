import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { MarketDataProviderService, AssetPrice } from '../marketDataProvider/marketDataProvider.service';
import { Asset, AssetClasses } from '../assets/asset.entity';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { FilesService } from '../files/files.service';
import { DateHelper } from '../common/helpers/date.helper';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { GetRequestResponse, OrderBy } from '../common/dto/request';
import {
  AssetHistoricalPriceCsvRow,
  FindAssetHistoricalPriceDto,
  GetAssetHistoricalPricesDto
} from './assetHistoricalPrices.dto';
import { Currencies } from '../common/enums/number';

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);

  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPricesRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly filesService: FilesService,
    private readonly dateHelper: DateHelper,
    private readonly currencyHelper: CurrencyHelper
  ) {}

  public async importPrices(
    asset: Asset,
    file: Express.Multer.File,
    manager: EntityManager
  ): Promise<AssetHistoricalPrice[]> {
    const fileContent = await this.filesService.readCsvFile<AssetHistoricalPriceCsvRow>(file);
    const assetPrices: AssetPrice[] = [];

    for (const assetPriceRow of fileContent) {
      const { date, price } = assetPriceRow;
      const parsedPrice = this.currencyHelper.parse(price);
      const parsedDate = new Date(date);

      parsedDate.setUTCHours(0, 0, 0, 0);

      assetPrices.push({
        date: parsedDate.getTime(),
        close: parsedPrice
      });
    }

    return await this.create(asset, assetPrices, manager);
  }

  public async syncPrices(assetId: number, manager?: EntityManager): Promise<AssetHistoricalPrice[]> {
    const asset = await this.assetsRepository.findOne({
      where: { id: assetId }
    });
    const [lastAssetHistoricalPrice] = await this.getMostRecent([asset.id]);
    const mappedAssetCode = asset.class === AssetClasses.Cryptocurrency ? `${asset.code}-USD` : asset.code;
    const fullAssetCode = asset.currency === Currencies.BRL ? `${mappedAssetCode}.SA` : mappedAssetCode;
    const assetData = await this.marketDataProviderService.getAssetHistoricalData(
      fullAssetCode,
      lastAssetHistoricalPrice ? this.dateHelper.incrementDays(new Date(lastAssetHistoricalPrice.date), 1) : undefined,
      true
    );

    return await this.create(asset, assetData.prices, manager);
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
    getAssetHistoricalPricesDto: GetAssetHistoricalPricesDto
  ): Promise<GetRequestResponse<AssetHistoricalPrice>> {
    const page = Number(getAssetHistoricalPricesDto?.page || 0);
    const limit =
      getAssetHistoricalPricesDto?.limit && getAssetHistoricalPricesDto.limit !== '0'
        ? Number(getAssetHistoricalPricesDto.limit)
        : 10;
    const orderByColumn = `assetHistoricalPrices.${getAssetHistoricalPricesDto.orderByColumn ?? 'assetId'}`;
    const orderBy = getAssetHistoricalPricesDto.orderBy ?? OrderBy.Asc;
    const builder = this.assetHistoricalPricesRepository
      .createQueryBuilder('assetHistoricalPrices')
      .where({ assetId: getAssetHistoricalPricesDto.assetId })
      .orderBy(orderByColumn, orderBy);

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

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
