import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payout, PayoutTypes } from './payout.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { CreatePayoutDto, GetPayoutsDto, PayoutCsvRow, PayoutsOverview, UpdatePayoutDto } from './payouts.dto';
import { Asset } from '../assets/asset.entity';
import { GetRequestResponse } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { DateHelper } from '../common/helpers/date.helper';
import { MarketIndexesService } from '../marketIndexes/marketIndexes.service';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper,
    private readonly filesService: FilesService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly marketIndexesService: MarketIndexesService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async create(portfolioAssetId: number, createPayoutDto: CreatePayoutDto): Promise<Payout> {
    const { type, date, quantity, value, withdrawalDate } = createPayoutDto;
    const portfolioAsset = await this.portfoliosAssetsService.find(portfolioAssetId);
    const taxes = this.calculateTaxes(portfolioAsset.asset, type, quantity, value);
    const total = quantity * value - taxes;
    const receivedDateExchangeRate = await this.findExchangeRate(
      portfolioAsset.asset.code,
      portfolioAsset.asset.currency,
      date
    );
    const withdrawalDateExchangeRate = withdrawalDate
      ? await this.findExchangeRate(portfolioAsset.asset.code, portfolioAsset.asset.currency, withdrawalDate)
      : undefined;
    const payout = new Payout(
      portfolioAssetId,
      type,
      date,
      quantity,
      value,
      taxes,
      total,
      portfolioAsset.asset.currency,
      receivedDateExchangeRate,
      withdrawalDate,
      withdrawalDateExchangeRate
    );

    portfolioAsset.payoutsReceived += payout.total;

    return await this.payoutRepository.manager.transaction(async (manager) => {
      await manager.save([payout, portfolioAsset]);

      return payout;
    });
  }

  public async import(portfolioAssetId: number, file: Express.Multer.File): Promise<Payout[]> {
    const portfolioAsset = await this.portfoliosAssetsService.find(portfolioAssetId);
    const fileContent = await this.filesService.readCsvFile<PayoutCsvRow>(file);
    const payouts: Payout[] = [];

    for (const payoutRow of fileContent) {
      const { Asset, Date, Quantity, Type, Value, Withdrawal } = payoutRow;

      if (Asset === portfolioAsset.asset.code) {
        const parsedQuantity = parseFloat(Quantity.replace(',', '.'));
        const parsedValue = this.currencyHelper.parse(Value);
        const taxes = this.calculateTaxes(portfolioAsset.asset, Type, parsedQuantity, parsedValue);
        const total = parsedQuantity * parsedValue - taxes;
        const receivedDateExchangeRate = await this.findExchangeRate(
          portfolioAsset.asset.code,
          portfolioAsset.asset.currency,
          Date
        );
        const withdrawalDateExchangeRate = Withdrawal
          ? await this.findExchangeRate(portfolioAsset.asset.code, portfolioAsset.asset.currency, Withdrawal)
          : undefined;

        const payout = new Payout(
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

        portfolioAsset.payoutsReceived += payout.total;

        payouts.push(payout);
      }
    }

    await this.payoutRepository.manager.transaction(async (manager) => {
      await manager.save([...payouts, portfolioAsset]);
    });

    return payouts;
  }

  public async getOverview(portfolioId: number): Promise<PayoutsOverview> {
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

  public async get(portfolioId: number, getPayoutsDto?: GetPayoutsDto): Promise<GetRequestResponse<Payout>> {
    const page: number | null = getPayoutsDto?.page ? Number(getPayoutsDto.page) : null;
    const limit: number | null =
      getPayoutsDto?.limit && getPayoutsDto.limit !== '0' ? Number(getPayoutsDto.limit) : null;
    const builder = this.payoutRepository
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

    const payouts = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: payouts,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async update(id: number, updatePayoutDto: UpdatePayoutDto): Promise<Payout> {
    const payout = await this.find(id);

    if (updatePayoutDto.date && updatePayoutDto.date !== payout.date) {
      payout.receivedDateExchangeRate = await this.findExchangeRate(
        payout.portfolioAsset.asset.code,
        payout.portfolioAsset.asset.currency,
        updatePayoutDto.date
      );
    }

    if (updatePayoutDto.withdrawalDate && updatePayoutDto.withdrawalDate !== payout.withdrawalDate) {
      payout.withdrawalDateExchangeRate = await this.findExchangeRate(
        payout.portfolioAsset.asset.code,
        payout.portfolioAsset.asset.currency,
        updatePayoutDto.withdrawalDate
      );
    }

    this.payoutRepository.merge(payout, updatePayoutDto);

    payout.portfolioAsset.payoutsReceived -= payout.total;
    payout.taxes = this.calculateTaxes(payout.portfolioAsset.asset, payout.type, payout.quantity, payout.value);
    payout.total = payout.quantity * payout.value - payout.taxes;
    payout.portfolioAsset.payoutsReceived += payout.total;

    return await this.payoutRepository.manager.transaction(async (manager) => {
      await manager.save([payout, payout.portfolioAsset]);

      return payout;
    });
  }

  public async delete(id: number): Promise<void> {
    const payout = await this.find(id);

    payout.portfolioAsset.payoutsReceived -= payout.total;

    this.payoutRepository.manager.transaction(async (manager) => {
      await manager.delete(Payout, id);
      await manager.save(payout.portfolioAsset);
    });

    await this.payoutRepository.delete(id);
  }

  private calculateTaxes(asset: Asset, type: PayoutTypes, quantity: number, value: number): number {
    let taxes = 0;

    if (type === PayoutTypes.JCP || asset.currency === Currencies.USD) {
      const taxRate = asset.currency === Currencies.USD ? 0.3 : 0.15;
      const grossValue = quantity * value;

      taxes = taxRate * grossValue;
    }

    return taxes;
  }

  private async findExchangeRate(code: string, currency: Currencies, date: string): Promise<number> {
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

  private async find(id: number): Promise<Payout> {
    const payout = await this.payoutRepository.findOne({
      where: { id },
      relations: ['portfolioAsset.asset']
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }
}
