import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { MarketDataProviderService, AssetPrice, AssetData } from '../marketDataProvider/marketDataProvider.service';
import { Asset } from '../assets/asset.entity';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { GetRequestParams, GetRequestResponse } from '../common/dto/request';

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);

  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPricesRepository: Repository<AssetHistoricalPrice>,
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly dateHelper: DateHelper
  ) {}

  public async syncPrices(assetId: number, manager: EntityManager): Promise<AssetHistoricalPrice[]> {
    const asset = await this.assetsRepository.findOne({ where: { id: assetId } });
    const [lastAssetHistoricalPrice] = await this.getMostRecents([asset.id]);
    const assetData = await this.marketDataProviderService.getAssetHistoricalData(
      `${asset.ticker}.SA`,
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
    const assetHistoricalPrices = assetPrices.map((assetPrice) => {
      return new AssetHistoricalPrice(
        asset.id,
        this.dateHelper.format(new Date(assetPrice.date), 'yyyy-MM-dd'),
        assetPrice.close
      );
    });

    if (manager) {
      await manager.save(assetHistoricalPrices);
    } else {
      await this.assetHistoricalPricesRepository.save(assetHistoricalPrices);
    }

    return assetHistoricalPrices;
  }

  public async get(assetId: number, params?: GetRequestParams): Promise<GetRequestResponse<AssetHistoricalPrice>> {
    const page = Number(params?.page || 0);
    const limit = params?.limit && params.limit !== '0' ? Number(params.limit) : 10;
    const builder = this.assetHistoricalPricesRepository
      .createQueryBuilder()
      .where({ assetId })
      .skip(page * limit)
      .take(limit);
    const assetHistoricalPrices = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: assetHistoricalPrices,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async getMostRecents(assetIds: number[], beforeDate?: string): Promise<AssetHistoricalPrice[]> {
    const builder = this.assetHistoricalPricesRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      })
      .where('assetHistoricalPrice.assetId IN (:...assetIds)', { assetIds });

    if (beforeDate) {
      builder.andWhere('assetHistoricalPrice.date <= :beforeDate', { beforeDate });
    }

    return await builder.getMany();
  }
}
