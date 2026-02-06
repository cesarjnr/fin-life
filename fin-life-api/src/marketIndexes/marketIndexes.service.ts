import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MarketIndex } from './marketIndex.entity';
import {
  CreateMarketIndexDto,
  FindMarketIndexDto,
  GetMarketIndexesDto,
  SyncMarketIndexDataDto
} from './marketIndexes.dto';
import { MarketDataProviderService } from '../marketDataProvider/marketDataProvider.service';
import { MarketIndexHistoricalData } from '../marketIndexHistoricalData/marketIndexHistoricalData.entity';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { GetRequestResponse } from '../common/dto/request';

@Injectable()
export class MarketIndexesService {
  private readonly logger = new Logger(MarketIndexesService.name);

  constructor(
    @InjectRepository(MarketIndex) private readonly marketIndexesRepository: Repository<MarketIndex>,
    private readonly marketDataProviderService: MarketDataProviderService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async create(createMarketIndexDto: CreateMarketIndexDto): Promise<MarketIndex> {
    const { code, interval, type, from, to } = createMarketIndexDto;

    await this.checkIfIndexAlreadyExists(code);

    return await this.marketIndexesRepository.manager.transaction(async (manager) => {
      const marketIndex = new MarketIndex(code, interval, type);

      await manager.save(marketIndex);

      const parsedFrom = from ? new Date(from) : undefined;
      const parsedTo = to ? new Date(to) : undefined;
      const indexData = await this.marketDataProviderService.getIndexHistoricalData(code, type, parsedFrom, parsedTo);
      const marketIndexHistoricalData = await this.marketIndexHistoricalDataService.create(
        marketIndex,
        indexData,
        manager
      );
      const allTimeHighValue = this.findAllTimeHighValue(marketIndexHistoricalData);

      marketIndex.allTimeHighValue = allTimeHighValue;

      await manager.save(marketIndex);

      marketIndex.marketIndexHistoricalData = [marketIndexHistoricalData[marketIndexHistoricalData.length - 1]];

      return marketIndex;
    });
  }

  public async syncData(syncMarketIndexDataDto?: SyncMarketIndexDataDto): Promise<MarketIndex[]> {
    this.logger.log(`[syncData] Synchronizing market indexes data...`);

    const marketIndexesToSync = await this.getMarketIndexesToSync(syncMarketIndexDataDto.marketIndexId);

    this.logger.log(`[syncData] ${marketIndexesToSync.length} market indexes found`);

    for (const marketIndex of marketIndexesToSync) {
      try {
        this.logger.log(`[syncData] Synchronizing data for index ${marketIndex.code}`);

        await this.marketIndexesRepository.manager.transaction(async (manager) => {
          const marketIndexHistoricalData = await this.marketIndexHistoricalDataService.syncData(marketIndex, manager);

          this.logger.log(`[syncData] ${marketIndexHistoricalData.length} data found to be synchronized`);

          if (marketIndexHistoricalData.length) {
            const highestValueAmongNewData = this.findAllTimeHighValue(marketIndexHistoricalData);

            if (highestValueAmongNewData > marketIndex.allTimeHighValue) {
              marketIndex.allTimeHighValue = highestValueAmongNewData;
              marketIndex.marketIndexHistoricalData = undefined;

              await manager.save(marketIndex);
            }

            marketIndex.marketIndexHistoricalData = marketIndexHistoricalData;
          }

          this.logger.log(`[syncData] Data for index ${marketIndex.code} successfully synchronized`);
        });
      } catch (error) {
        this.logger.error(`[syncData] Error when synchronizing data for index ${marketIndex.code}: ${error.message}`);
      }
    }

    this.logger.log('[syncData] Market indexes data successfully synchronized');

    return marketIndexesToSync;
  }

  public async get(getMarketIndexesDto?: GetMarketIndexesDto): Promise<GetRequestResponse<MarketIndex>> {
    const { codes, active } = getMarketIndexesDto || {};
    const page: number | null = getMarketIndexesDto?.page ? Number(getMarketIndexesDto.page) : null;
    const limit: number | null =
      getMarketIndexesDto?.limit && getMarketIndexesDto.limit !== '0' ? Number(getMarketIndexesDto.limit) : null;
    const builder = this.marketIndexesRepository.createQueryBuilder('marketIndex').orderBy('marketIndex.code');

    if (codes?.length) {
      builder.andWhere({ code: In(Array.isArray(codes) ? codes : [codes]) });
    }

    if (active !== undefined) {
      builder.andWhere({ active });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    let marketIndexes = await builder.getMany();
    const total = await builder.getCount();

    marketIndexes = await this.getLatestMarketIndexesData(marketIndexes);

    return {
      data: marketIndexes,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async delete(id: number): Promise<void> {
    const marketIndex = await this.find({ id });

    await this.marketIndexesRepository.delete(marketIndex.id);
  }

  public async find(findMarketIndexDto?: FindMarketIndexDto): Promise<MarketIndex> {
    this.logger.log(`[find] Finding market index...`);

    const { id, code, active, relations } = findMarketIndexDto || {};
    const builder = this.marketIndexesRepository.createQueryBuilder('marketIndex');

    if (id) {
      builder.andWhere({ id });
    }

    if (code) {
      builder.where({ code });
    }

    if (active !== undefined) {
      builder.andWhere({ active });
    }

    if (relations?.length) {
      relations.forEach((relation) => {
        builder.leftJoinAndSelect(`marketIndex.${relation.name}`, relation.alias);
      });
    }

    let marketIndex = await builder.getOne();

    if (!marketIndex) {
      throw new NotFoundException('Market index not found');
    }

    if (!marketIndex.marketIndexHistoricalData?.length) {
      const marketIndexWithLatestData = await this.getLatestMarketIndexesData([marketIndex]);

      marketIndex = marketIndexWithLatestData[0];
    }

    this.logger.log(`[find] Market index ${marketIndex.code} found`);

    return marketIndex;
  }

  private async checkIfIndexAlreadyExists(code: string): Promise<void> {
    const marketIndex = await this.marketIndexesRepository.findOne({ where: { code: code.toUpperCase() } });

    if (marketIndex) {
      throw new ConflictException('Index already exists');
    }
  }

  private findAllTimeHighValue(marketIndexHistoricalData: MarketIndexHistoricalData[]): number {
    let allTimeHighValue = 0;

    marketIndexHistoricalData.forEach((indexHistoricalData) => {
      if (indexHistoricalData.value > allTimeHighValue) {
        allTimeHighValue = indexHistoricalData.value;
      }
    });

    return allTimeHighValue;
  }

  private async getMarketIndexesToSync(marketIndexId?: number): Promise<MarketIndex[]> {
    const marketIndexesToSync: MarketIndex[] = [];

    if (marketIndexId) {
      this.logger.log(`[getMarketIndexesToSync] Getting market index ${marketIndexId} to sync...`);

      const marketIndex = await this.find({
        id: marketIndexId,
        active: true
      });

      marketIndexesToSync.push(marketIndex);
    } else {
      this.logger.log('[getMarketIndexesToSync] Getting market indexes to sync...');

      const marketIndexes = await this.marketIndexesRepository.find({
        where: {
          active: true
        }
      });

      for (const marketIndex of marketIndexes) {
        const marketIndexToSync = await this.find({ id: marketIndex.id });

        marketIndexesToSync.push(marketIndexToSync);
      }
    }

    return marketIndexesToSync;
  }

  private async getLatestMarketIndexesData(marketIndexes: MarketIndex[]): Promise<MarketIndex[]> {
    const marketIndexIds = marketIndexes.map((marketIndex) => marketIndex.id);
    const marketIndexesHistoricalData = await this.marketIndexHistoricalDataService.getMostRecent(marketIndexIds);

    return marketIndexes.map((marketIndex) => {
      const latestMarketIndexData = marketIndexesHistoricalData.find(
        (indexHistoricalData) => indexHistoricalData.marketIndexId === marketIndex.id
      );

      if (latestMarketIndexData) {
        Object.assign(marketIndex, { marketIndexHistoricalData: [latestMarketIndexData] });
      }

      return marketIndex;
    });
  }
}
