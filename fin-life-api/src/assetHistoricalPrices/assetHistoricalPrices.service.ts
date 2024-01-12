import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { AssetsService } from '../assets/assets.service';
import { AssetPrice } from '../assetDataProvider/assetDataProvider.service';
import { Asset } from '../assets/asset.entity';
import { AssetHistoricalPrice } from './assetHistoricalPrice.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

@Injectable()
export class AssetHistoricalPricesService {
  // private readonly logger = new Logger(AssetHistoricalPricesService.name);
  private assetsService: AssetsService;

  constructor(
    @InjectRepository(AssetHistoricalPrice)
    private readonly assetHistoricalPricesRepository: Repository<AssetHistoricalPrice>,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(asset: Asset, assetPrices: AssetPrice[], manager?: EntityManager): Promise<void> {
    const assetHistoricalPrices = assetPrices.map((assetPrice) => {
      return new AssetHistoricalPrice(
        asset.id,
        this.dateHelper.format(new Date(assetPrice.date * 1000), 'yyyy-MM-dd'),
        assetPrice.closing
      );
    });

    if (manager) {
      await manager.save(assetHistoricalPrices);
    } else {
      await this.assetHistoricalPricesRepository.save(assetHistoricalPrices);
    }
  }

  public async get(assetId: number, params?: PaginationParams): Promise<PaginationResponse<AssetHistoricalPrice>> {
    const page = Number(params?.page || 0);
    const limit = Number(params?.limit || 10);
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

  public async getMostRecentsBeforeDate(assetIds: number[], beforeDate: string): Promise<AssetHistoricalPrice[]> {
    return await this.assetHistoricalPricesRepository
      .createQueryBuilder('assetHistoricalPrice')
      .distinctOn(['assetHistoricalPrice.assetId'])
      .orderBy({
        'assetHistoricalPrice.assetId': 'DESC',
        'assetHistoricalPrice.date': 'DESC'
      })
      .where('assetHistoricalPrice.assetId IN (:...assetIds)', { assetIds })
      .andWhere('assetHistoricalPrice.date <= :beforeDate', { beforeDate })
      .getMany();
  }
}
