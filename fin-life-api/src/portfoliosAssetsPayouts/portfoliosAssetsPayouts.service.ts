import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetPayout, PortfolioAssetPayoutTypes } from './portfolioAssetPayout.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import {
  CreatePortfolioAssetPayoutDto,
  GetPortfolioAssetPayoutsDto,
  PortfolioAssetPayoutCsvRow,
  PortfolioAssetsPayoutsOverview,
  UpdatePortfolioAssetPayoutDto
} from './portfoliosAssetsPayouts.dto';
import { Asset } from '../assets/asset.entity';
import { GetRequestResponse } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { DateHelper } from '../common/helpers/date.helper';

@Injectable()
export class PortfoliosAssetsPayoutsService {
  constructor(
    @InjectRepository(PortfolioAssetPayout)
    private readonly portfolioAssetPayoutRepository: Repository<PortfolioAssetPayout>,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper,
    private readonly filesService: FilesService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async create(
    portfolioAssetId: number,
    createPayoutDto: CreatePortfolioAssetPayoutDto
  ): Promise<PortfolioAssetPayout> {
    const { type, date, quantity, value } = createPayoutDto;
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId, relations: ['asset'] });
    const taxes = this.calculateTaxes(portfolioAsset.asset, type, quantity, value);
    const total = quantity * value - taxes;
    const receivedDateExchangeRate = await this.findReceivedDateExchangeRate(
      portfolioAsset.asset.ticker,
      portfolioAsset.asset.currency,
      date
    );
    const payout = new PortfolioAssetPayout(
      portfolioAssetId,
      type,
      date,
      quantity,
      value,
      taxes,
      total,
      portfolioAsset.asset.currency,
      receivedDateExchangeRate,
      0
    );

    portfolioAsset.payoutsReceived += payout.total;

    return await this.portfolioAssetPayoutRepository.manager.transaction(async (manager) => {
      await manager.save([payout, portfolioAsset]);

      return payout;
    });
  }

  public async import(portfolioAssetId: number, file: Express.Multer.File): Promise<PortfolioAssetPayout[]> {
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId, relations: ['asset'] });
    const fileContent = await this.filesService.readCsvFile<PortfolioAssetPayoutCsvRow>(file);
    const payouts: PortfolioAssetPayout[] = [];

    for (const payoutRow of fileContent) {
      const { Asset, Date, Quantity, Type, Value } = payoutRow;

      if (Asset === portfolioAsset.asset.ticker) {
        const parsedQuantity = parseFloat(Quantity.replace(',', '.'));
        const parsedValue = this.currencyHelper.parse(Value);
        const taxes = this.calculateTaxes(portfolioAsset.asset, Type, parsedQuantity, parsedValue);
        const total = parsedQuantity * parsedValue - taxes;
        const receivedDateExchangeRate = await this.findReceivedDateExchangeRate(
          portfolioAsset.asset.ticker,
          portfolioAsset.asset.currency,
          Date
        );

        const payout = new PortfolioAssetPayout(
          portfolioAssetId,
          Type,
          Date,
          parsedQuantity,
          parsedValue,
          taxes,
          total,
          portfolioAsset.asset.currency,
          receivedDateExchangeRate,
          0
        );

        portfolioAsset.payoutsReceived += payout.total;

        payouts.push(payout);
      }
    }

    await this.portfolioAssetPayoutRepository.manager.transaction(async (manager) => {
      await manager.save([...payouts, portfolioAsset]);
    });

    return payouts;
  }

  public async getOverview(portfolioId: number): Promise<PortfolioAssetsPayoutsOverview> {
    const { data } = await this.get(portfolioId);
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
    getPayoutsDto?: GetPortfolioAssetPayoutsDto
  ): Promise<GetRequestResponse<PortfolioAssetPayout>> {
    const page: number | null = getPayoutsDto?.page ? Number(getPayoutsDto.page) : null;
    const limit: number | null =
      getPayoutsDto?.limit && getPayoutsDto.limit !== '0' ? Number(getPayoutsDto.limit) : null;
    const builder = this.portfolioAssetPayoutRepository
      .createQueryBuilder('payout')
      .orderBy('payout.date')
      .leftJoinAndSelect('payout.portfolioAsset', 'portfolioAsset')
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .andWhere('portfolioAsset.portfolio_id = :portfolioId', {
        portfolioId
      });

    if (getPayoutsDto?.portfolioAssetId) {
      builder.andWhere('payout.portfolio_asset_id = :portfolioAssetId', {
        portfolioAssetId: getPayoutsDto.portfolioAssetId
      });
    }

    if (getPayoutsDto?.from) {
      builder.andWhere('payout.date >= :from', { from: getPayoutsDto.from });
    }

    if (getPayoutsDto?.to) {
      builder.andWhere('payout.date <= :to', { to: getPayoutsDto.to });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const portfolioAssetPayouts = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: portfolioAssetPayouts,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async update(id: number, updatePayoutDto: UpdatePortfolioAssetPayoutDto): Promise<PortfolioAssetPayout> {
    const payout = await this.find(id);

    payout.portfolioAsset.payoutsReceived -= payout.total;

    this.portfolioAssetPayoutRepository.merge(payout, updatePayoutDto);

    payout.taxes = this.calculateTaxes(payout.portfolioAsset.asset, payout.type, payout.quantity, payout.value);
    payout.total = payout.quantity * payout.value - payout.taxes;
    payout.portfolioAsset.payoutsReceived += payout.total;

    return await this.portfolioAssetPayoutRepository.manager.transaction(async (manager) => {
      await manager.save([payout, payout.portfolioAsset]);

      return payout;
    });
  }

  public async delete(id: number): Promise<void> {
    const payout = await this.find(id);

    payout.portfolioAsset.payoutsReceived -= payout.total;

    this.portfolioAssetPayoutRepository.manager.transaction(async (manager) => {
      await manager.delete(PortfolioAssetPayout, id);
      await manager.save(payout.portfolioAsset);
    });

    await this.portfolioAssetPayoutRepository.delete(id);
  }

  private calculateTaxes(asset: Asset, type: PortfolioAssetPayoutTypes, quantity: number, value: number): number {
    let taxes = 0;

    if (type === PortfolioAssetPayoutTypes.JCP || asset.currency === Currencies.USD) {
      const taxRate = asset.currency === Currencies.USD ? 0.3 : 0.15;
      const grossValue = quantity * value;

      taxes = taxRate * grossValue;
    }

    return taxes;
  }

  private async findReceivedDateExchangeRate(ticker: string, currency: Currencies, date: string): Promise<number> {
    if (currency === Currencies.BRL) return 0;

    const parsedDate = new Date(`${date}T00:00:00.000`);
    const previousDay = this.dateHelper.subtractDays(parsedDate, 1);
    const previousStrDate = this.dateHelper.format(previousDay, 'yyyy-MM-dd');
    const marketIndexData = await this.marketIndexHistoricalDataService.findMostRecent(ticker, previousStrDate);

    return marketIndexData.value;
  }

  private async find(id: number): Promise<PortfolioAssetPayout> {
    const payout = await this.portfolioAssetPayoutRepository.findOne({
      where: { id },
      relations: ['portfolioAsset.asset']
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }
}
