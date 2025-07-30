import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetDividend, PortfolioAssetDividendTypes } from './portfolioAssetDividend.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import {
  CreatePortfolioAssetDividendDto,
  GetPortfolioAssetDividendsDto,
  PortfolioAssetDividendCsvRow,
  PortfolioAssetsDividendsOverview,
  UpdatePortfolioAssetDividendDto
} from './portfoliosAssetsDividends.dto';
import { Asset } from '../assets/asset.entity';
import { GetRequestResponse } from '../common/dto/request';
import { Currencies } from '../common/enums/number';
import { MarketIndexHistoricalDataService } from '../marketIndexHistoricalData/marketIndexHistoricalData.service';
import { DateHelper } from '../common/helpers/date.helper';

@Injectable()
export class PortfoliosAssetsDividendsService {
  constructor(
    @InjectRepository(PortfolioAssetDividend)
    private readonly portfolioAssetDividendRepository: Repository<PortfolioAssetDividend>,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper,
    private readonly filesService: FilesService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly marketIndexHistoricalDataService: MarketIndexHistoricalDataService
  ) {}

  public async create(
    portfolioAssetId: number,
    createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    const { type, date, quantity, value } = createPortfolioAssetDividendDto;
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId, relations: ['asset'] });
    const taxes = this.calculateTaxes(portfolioAsset.asset, type, quantity, value);
    const total = quantity * value - taxes;
    const receivedDateExchangeRate = await this.findReceivedDateExchangeRate(
      portfolioAsset.asset.ticker,
      portfolioAsset.asset.currency,
      date
    );
    const portfolioAssetDividend = new PortfolioAssetDividend(
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

    portfolioAsset.dividendsPaid += portfolioAssetDividend.total;

    return await this.portfolioAssetDividendRepository.manager.transaction(async (manager) => {
      await manager.save([portfolioAssetDividend, portfolioAsset]);

      return portfolioAssetDividend;
    });
  }

  public async import(portfolioAssetId: number, file: Express.Multer.File): Promise<PortfolioAssetDividend[]> {
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId, relations: ['asset'] });
    const fileContent = await this.filesService.readCsvFile<PortfolioAssetDividendCsvRow>(file);
    const portfolioAssetDividends: PortfolioAssetDividend[] = [];

    for (const portfolioAssetDividendRow of fileContent) {
      const { Asset, Date, Quantity, Type, Value } = portfolioAssetDividendRow;

      if (Asset === portfolioAsset.asset.ticker) {
        const parsedQuantity = Number(Quantity);
        const parsedValue = this.currencyHelper.parse(Value);
        const taxes = this.calculateTaxes(portfolioAsset.asset, Type, parsedQuantity, parsedValue);
        const total = parsedQuantity * parsedValue - taxes;
        const portfolioAssetDividend = new PortfolioAssetDividend(
          portfolioAssetId,
          Type,
          Date,
          parsedQuantity,
          parsedValue,
          taxes,
          total,
          portfolioAsset.asset.currency,
          0,
          0
        );

        portfolioAsset.dividendsPaid += portfolioAssetDividend.total;

        portfolioAssetDividends.push(portfolioAssetDividend);
      }
    }

    await this.portfolioAssetDividendRepository.manager.transaction(async (manager) => {
      await manager.save([...portfolioAssetDividends, portfolioAsset]);
    });

    return portfolioAssetDividends;
  }

  public async getOverview(portfolioId: number): Promise<PortfolioAssetsDividendsOverview> {
    const { data } = await this.get(portfolioId);
    const { data: portfoliosAssets } = await this.portfoliosAssetsService.get({ portfolioId });

    const investedBalance = portfoliosAssets.reduce((acc, portfolioAsset) => acc + portfolioAsset.cost, 0);
    const total = data.reduce((acc, portfolioAssetDividend) => acc + portfolioAssetDividend.total, 0);
    const yieldOnCost = total / investedBalance;

    return { total, yieldOnCost };
  }

  public async get(
    portfolioId: number,
    getPortfolioAssetDividendsDto?: GetPortfolioAssetDividendsDto
  ): Promise<GetRequestResponse<PortfolioAssetDividend>> {
    const page: number | null = getPortfolioAssetDividendsDto?.page ? Number(getPortfolioAssetDividendsDto.page) : null;
    const limit: number | null =
      getPortfolioAssetDividendsDto?.limit && getPortfolioAssetDividendsDto.limit !== '0'
        ? Number(getPortfolioAssetDividendsDto.limit)
        : null;
    const builder = this.portfolioAssetDividendRepository
      .createQueryBuilder('portfolioAssetDividend')
      .orderBy('portfolioAssetDividend.date')
      .leftJoinAndSelect('portfolioAssetDividend.portfolioAsset', 'portfolioAsset')
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .andWhere('portfolioAsset.portfolio_id = :portfolioId', {
        portfolioId
      });

    if (getPortfolioAssetDividendsDto?.portfolioAssetId) {
      builder.andWhere('portfolioAssetDividend.portfolio_asset_id = :portfolioAssetId', {
        portfolioAssetId: getPortfolioAssetDividendsDto.portfolioAssetId
      });
    }

    if (getPortfolioAssetDividendsDto?.from) {
      builder.andWhere('portfolioAssetDividend.date >= :from', { from: getPortfolioAssetDividendsDto.from });
    }

    if (getPortfolioAssetDividendsDto?.to) {
      builder.andWhere('portfolioAssetDividend.date <= :to', { to: getPortfolioAssetDividendsDto.to });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const portfolioAssetDividends = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: portfolioAssetDividends,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async update(
    id: number,
    updatePortfolioAssetDividendDto: UpdatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    const portfolioAssetDividend = await this.find(id);

    portfolioAssetDividend.portfolioAsset.dividendsPaid -= portfolioAssetDividend.total;

    this.portfolioAssetDividendRepository.merge(portfolioAssetDividend, updatePortfolioAssetDividendDto);

    portfolioAssetDividend.taxes = this.calculateTaxes(
      portfolioAssetDividend.portfolioAsset.asset,
      portfolioAssetDividend.type,
      portfolioAssetDividend.quantity,
      portfolioAssetDividend.value
    );
    portfolioAssetDividend.total =
      portfolioAssetDividend.quantity * portfolioAssetDividend.value - portfolioAssetDividend.taxes;
    portfolioAssetDividend.portfolioAsset.dividendsPaid += portfolioAssetDividend.total;

    return await this.portfolioAssetDividendRepository.manager.transaction(async (manager) => {
      await manager.save([portfolioAssetDividend, portfolioAssetDividend.portfolioAsset]);

      return portfolioAssetDividend;
    });
  }

  public async delete(id: number): Promise<void> {
    const portfolioAssetDividend = await this.find(id);

    portfolioAssetDividend.portfolioAsset.dividendsPaid -= portfolioAssetDividend.total;

    this.portfolioAssetDividendRepository.manager.transaction(async (manager) => {
      await manager.delete(PortfolioAssetDividend, id);
      await manager.save(portfolioAssetDividend.portfolioAsset);
    });

    await this.portfolioAssetDividendRepository.delete(id);
  }

  private async findReceivedDateExchangeRate(ticker: string, currency: Currencies, date: string): Promise<number> {
    if (currency === Currencies.BRL) return 0;

    const parsedDate = new Date(`${date}T00:00:00.000`);
    const previousDay = this.dateHelper.subtractDays(parsedDate, 1);
    const previousStrDate = this.dateHelper.format(previousDay, 'yyyy-MM-dd');
    const marketIndexData = await this.marketIndexHistoricalDataService.findMostRecent(ticker, previousStrDate);

    return marketIndexData.value;
  }

  private calculateTaxes(asset: Asset, type: PortfolioAssetDividendTypes, quantity: number, value: number): number {
    let taxes = 0;

    if (type === PortfolioAssetDividendTypes.JCP || asset.currency === Currencies.USD) {
      const taxRate = asset.currency === Currencies.USD ? 0.3 : 0.15;
      const grossValue = quantity * value;

      taxes = taxRate * grossValue;
    }

    return taxes;
  }

  private async find(id: number): Promise<PortfolioAssetDividend> {
    const portfolioAssetDividend = await this.portfolioAssetDividendRepository.findOne({
      where: { id },
      relations: ['portfolioAsset.asset']
    });

    if (!portfolioAssetDividend) {
      throw new NotFoundException('Dividend not found');
    }

    return portfolioAssetDividend;
  }
}
