import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetEvent, PortfolioAssetEventTypes } from './portfolioAssetEvent.entity';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import {
  CreatePortfolioAssetEventDto,
  GetPortfolioAssetEventsDto,
  PortfolioAssetPayoutsOverview,
  UpdatePortfolioAssetEventDto,
  PortfolioAssetEventCsvRow
} from './portfoliosAssetsEvents.dto';
import { Asset } from '../assets/asset.entity';
import { GetRequestResponse } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexesService } from '../marketIndexes/marketIndexes.service';

@Injectable()
export class PortfoliosAssetsEventsService {
  private readonly logger = new Logger(PortfoliosAssetsEventsService.name);

  constructor(
    @InjectRepository(PortfolioAssetEvent)
    private readonly portfoliosAssetsEventsRepository: Repository<PortfolioAssetEvent>,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper,
    private readonly filesService: FilesService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly marketIndexesService: MarketIndexesService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async create(
    portfolioAssetId: number,
    createPortfolioAssetEventDto: CreatePortfolioAssetEventDto
  ): Promise<PortfolioAssetEvent> {
    this.logger.log(`[create] Creating portfolio asset event for portfolio asset ${portfolioAssetId}...`);

    const { type, date, quantity, value, withdrawalDate } = createPortfolioAssetEventDto;
    const portfolioAsset = await this.portfoliosAssetsService.find(portfolioAssetId);
    const nonNullableValue = value || 0;
    const taxes = this.calculateTaxes(portfolioAsset.asset, type, quantity, nonNullableValue);
    const total = nonNullableValue * quantity - taxes;
    const receivedDateExchangeRate = await this.findExchangeRate('USD/BRL', portfolioAsset.asset.currency, date);
    const withdrawalDateExchangeRate = withdrawalDate
      ? await this.findExchangeRate('USD/BRL', portfolioAsset.asset.currency, withdrawalDate)
      : undefined;
    const portfolioAssetEvent = new PortfolioAssetEvent(
      portfolioAssetId,
      type,
      date,
      quantity,
      nonNullableValue,
      taxes,
      total,
      portfolioAsset.asset.currency,
      receivedDateExchangeRate,
      withdrawalDate,
      withdrawalDateExchangeRate
    );

    this.applyEventToPortfolioAsset(portfolioAsset, type, quantity, portfolioAssetEvent.total);

    return await this.portfoliosAssetsEventsRepository.manager.transaction(async (manager) => {
      await manager.save([portfolioAssetEvent, portfolioAsset]);

      this.logger.log('[create] Portfolio asset event successfully created');

      return portfolioAssetEvent;
    });
  }

  public async import(portfolioAssetId: number, file: Express.Multer.File): Promise<PortfolioAssetEvent[]> {
    const portfolioAsset = await this.portfoliosAssetsService.find(portfolioAssetId);
    const fileContent = await this.filesService.readCsvFile<PortfolioAssetEventCsvRow>(file);
    const portfolioAssetEvents: PortfolioAssetEvent[] = [];

    for (const payoutRow of fileContent) {
      const { Asset, Date, Quantity, Type, Value, Withdrawal } = payoutRow;

      if (Asset === portfolioAsset.asset.code) {
        const parsedQuantity = parseFloat(Quantity.replace(',', '.'));
        const parsedValue = Value ? this.currencyHelper.parse(Value) : 0;
        const taxes = this.calculateTaxes(portfolioAsset.asset, Type, parsedQuantity, parsedValue);
        const total = parsedValue * parsedQuantity - taxes;
        const receivedDateExchangeRate = await this.findExchangeRate('USD/BRL', portfolioAsset.asset.currency, Date);
        const withdrawalDateExchangeRate = Withdrawal
          ? await this.findExchangeRate('USD/BRL', portfolioAsset.asset.currency, Withdrawal)
          : undefined;

        const portfolioAssetEvent = new PortfolioAssetEvent(
          portfolioAssetId,
          Type,
          Date,
          parsedQuantity,
          parsedValue,
          taxes,
          total,
          portfolioAsset.asset.currency,
          receivedDateExchangeRate,
          Withdrawal || undefined,
          withdrawalDateExchangeRate
        );

        this.applyEventToPortfolioAsset(portfolioAsset, Type, parsedQuantity, portfolioAssetEvent.total);

        portfolioAssetEvents.push(portfolioAssetEvent);
      }
    }

    await this.portfoliosAssetsEventsRepository.manager.transaction(async (manager) => {
      await manager.save([...portfolioAssetEvents, portfolioAsset]);
    });

    return portfolioAssetEvents;
  }

  public async getPayoutsOverview(portfolioId: number): Promise<PortfolioAssetPayoutsOverview> {
    const { data } = await this.get(portfolioId, {
      types: [PortfolioAssetEventTypes.Dividend, PortfolioAssetEventTypes.JCP, PortfolioAssetEventTypes.Income]
    });
    const { data: portfoliosAssets } = await this.portfoliosAssetsService.get({ portfolioId });
    const investedBalance = portfoliosAssets.reduce((acc, portfolioAsset) => acc + portfolioAsset.cost, 0);
    const total = data.reduce((totalPayout, portfolioAssetPayout) => {
      if (portfolioAssetPayout.currency === Currencies.BRL) return (totalPayout += portfolioAssetPayout.total);

      return (totalPayout +=
        portfolioAssetPayout.total *
        (portfolioAssetPayout.withdrawalDateExchangeRate || portfolioAssetPayout.receivedDateExchangeRate));
    }, 0);
    const yieldOnCost = total / investedBalance;

    return { total, yieldOnCost };
  }

  public async get(
    portfolioId: number,
    getPortfolioAssetEventsDto?: GetPortfolioAssetEventsDto
  ): Promise<GetRequestResponse<PortfolioAssetEvent>> {
    const page: number | null = getPortfolioAssetEventsDto?.page ? Number(getPortfolioAssetEventsDto.page) : null;
    const limit: number | null =
      getPortfolioAssetEventsDto?.limit && getPortfolioAssetEventsDto.limit !== '0'
        ? Number(getPortfolioAssetEventsDto.limit)
        : null;
    const builder = this.portfoliosAssetsEventsRepository
      .createQueryBuilder('portfolioAssetEvent')
      .orderBy('portfolioAssetEvent.date')
      .leftJoinAndSelect('portfolioAssetEvent.portfolioAsset', 'portfolioAsset')
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .andWhere('portfolioAsset.portfolio_id = :portfolioId', {
        portfolioId
      });

    if (getPortfolioAssetEventsDto?.portfolioAssetId) {
      builder.andWhere('portfolioAssetEvent.portfolio_asset_id = :portfolioAssetId', {
        portfolioAssetId: getPortfolioAssetEventsDto.portfolioAssetId
      });
    }

    if (getPortfolioAssetEventsDto?.types?.length) {
      builder.andWhere('portfolioAssetEvent.type IN (:...types)', { types: getPortfolioAssetEventsDto.types });
    }

    if (getPortfolioAssetEventsDto?.from) {
      builder.andWhere('portfolioAssetEvent.date >= :from', { from: getPortfolioAssetEventsDto.from });
    }

    if (getPortfolioAssetEventsDto?.to) {
      builder.andWhere('portfolioAssetEvent.date <= :to', { to: getPortfolioAssetEventsDto.to });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const portfolioAssetEvents = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: portfolioAssetEvents,
      itemsPerPage: limit,
      page,
      total
    };
  }

  // public async update(
  //   id: number,
  //   updatePortfolioAssetEventDto: UpdatePortfolioAssetEventDto
  // ): Promise<PortfolioAssetEvent> {
  //   const portfolioAssetEvent = await this.find(id);

  //   if (updatePortfolioAssetEventDto.date && updatePortfolioAssetEventDto.date !== portfolioAssetEvent.date) {
  //     portfolioAssetEvent.receivedDateExchangeRate = await this.findExchangeRate(
  //       portfolioAssetEvent.portfolioAsset.asset.code,
  //       portfolioAssetEvent.portfolioAsset.asset.currency,
  //       updatePortfolioAssetEventDto.date
  //     );
  //   }

  //   if (
  //     updatePortfolioAssetEventDto.withdrawalDate &&
  //     updatePortfolioAssetEventDto.withdrawalDate !== portfolioAssetEvent.withdrawalDate
  //   ) {
  //     portfolioAssetEvent.withdrawalDateExchangeRate = await this.findExchangeRate(
  //       portfolioAssetEvent.portfolioAsset.asset.code,
  //       portfolioAssetEvent.portfolioAsset.asset.currency,
  //       updatePortfolioAssetEventDto.withdrawalDate
  //     );
  //   }

  //   this.portfoliosAssetsEventsRepository.merge(portfolioAssetEvent, updatePortfolioAssetEventDto);

  //   portfolioAssetEvent.portfolioAsset.payoutsReceived -= portfolioAssetEvent.total;
  //   portfolioAssetEvent.taxes = this.calculateTaxes(
  //     portfolioAssetEvent.portfolioAsset.asset,
  //     portfolioAssetEvent.type,
  //     portfolioAssetEvent.quantity,
  //     portfolioAssetEvent.value
  //   );
  //   portfolioAssetEvent.total = portfolioAssetEvent.quantity * portfolioAssetEvent.value - portfolioAssetEvent.taxes;
  //   portfolioAssetEvent.portfolioAsset.payoutsReceived += portfolioAssetEvent.total;

  //   return await this.portfoliosAssetsEventsRepository.manager.transaction(async (manager) => {
  //     await manager.save([portfolioAssetEvent, portfolioAssetEvent.portfolioAsset]);

  //     return portfolioAssetEvent;
  //   });
  // }

  // public async delete(id: number): Promise<void> {
  //   const portfolioAssetEvent = await this.find(id);

  //   portfolioAssetEvent.portfolioAsset.payoutsReceived -= portfolioAssetEvent.total;

  //   this.portfoliosAssetsEventsRepository.manager.transaction(async (manager) => {
  //     await manager.delete(PortfolioAssetEvent, id);
  //     await manager.save(portfolioAssetEvent.portfolioAsset);
  //   });

  //   await this.portfoliosAssetsEventsRepository.delete(id);
  // }

  private applyEventToPortfolioAsset(
    portfolioAsset: PortfolioAsset,
    type: PortfolioAssetEventTypes,
    quantity: number,
    total: number
  ): void {
    if (type === PortfolioAssetEventTypes.Bonus) {
      portfolioAsset.quantity += quantity;
      portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
    } else if (type === PortfolioAssetEventTypes.FractionalAuction) {
      portfolioAsset.salesCost += quantity * portfolioAsset.averageCost;
      portfolioAsset.quantity -= quantity;
      portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
      portfolioAsset.salesTotal += total;
    } else {
      portfolioAsset.payoutsReceived += total;
    }
  }

  private calculateTaxes(asset: Asset, type: PortfolioAssetEventTypes, quantity: number, value: number): number {
    this.logger.log('[calculateTaxes] Calculating taxes...');

    let taxes = 0;

    if (type === PortfolioAssetEventTypes.JCP || asset.currency === Currencies.USD) {
      const taxRate = asset.currency === Currencies.USD ? 0.3 : 0.15;
      const grossValue = quantity * value;

      taxes = taxRate * grossValue;
    }

    return taxes;
  }

  private async findExchangeRate(code: string, currency: Currencies, date: string): Promise<number> {
    this.logger.log(`[findExchangeRate] Finding exchange rate for ${code}...`);

    if (currency === Currencies.BRL) return 0;

    const parsedDate = this.dateHelper.parse(date);
    const previousDay = this.dateHelper.subtractDays(parsedDate, 1);
    const previousStrDate = this.dateHelper.format(previousDay, 'yyyy-MM-dd');
    const marketIndex = await this.marketIndexesService.find({ code });
    const marketIndexData = await this.marketIndexHistoricalDataService.getMostRecent(
      [marketIndex.id],
      previousStrDate
    );

    return marketIndexData[0].value;
  }

  // private async find(id: number): Promise<PortfolioAssetEvent> {
  //   const portfolioAssetEvent = await this.portfoliosAssetsEventsRepository.findOne({
  //     where: { id },
  //     relations: ['portfolioAsset.asset']
  //   });

  //   if (!portfolioAssetEvent) {
  //     throw new NotFoundException('Portfolio asset event not found');
  //   }

  //   return portfolioAssetEvent;
  // }
}
