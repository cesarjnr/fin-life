import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetDividend, PortfolioAssetDividendTypes } from './portfolioAssetDividend.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { CreatePortfolioAssetDividendDto, UpdatePortfolioAssetDividendDto } from './portfoliosAssetsDividends.dto';
import { Asset, AssetCurrencies } from '../assets/asset.entity';
import { PaginationParams, PaginationResponse } from 'src/common/dto/pagination';

export type GetPortfolioAssetDividendsDto = PaginationParams & { portfolioAssetId: number };

interface PortfolioAssetDividendCsvRow {
  Asset: string;
  Date: string;
  Quantity: string;
  Type: PortfolioAssetDividendTypes;
  Value: string;
}

@Injectable()
export class PortfoliosAssetsDividendsService {
  constructor(
    @InjectRepository(PortfolioAssetDividend)
    private readonly portfolioAssetDividendRepository: Repository<PortfolioAssetDividend>,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly filesService: FilesService,
    private readonly currencyHelper: CurrencyHelper
  ) {}

  public async create(
    portfolioAssetId: number,
    createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    const { type, date, quantity, value } = createPortfolioAssetDividendDto;
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId, relations: ['asset'] });
    const taxes = this.calculateTaxes(portfolioAsset.asset, type, quantity, value);
    const total = quantity * value - taxes;
    const portfolioAssetDividend = new PortfolioAssetDividend(
      portfolioAssetId,
      type,
      date,
      quantity,
      value,
      taxes,
      total,
      0,
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

  public async get(
    getPortfolioAssetDividendsDto: GetPortfolioAssetDividendsDto
  ): Promise<PaginationResponse<PortfolioAssetDividend>> {
    const page = Number(getPortfolioAssetDividendsDto?.page || 0);
    const limit =
      getPortfolioAssetDividendsDto?.limit && getPortfolioAssetDividendsDto.limit !== '0'
        ? Number(getPortfolioAssetDividendsDto.limit)
        : 10;
    const builder = this.portfolioAssetDividendRepository
      .createQueryBuilder('portfolioAssetDividend')
      .where('portfolioAssetDividend.portfolio_asset_id = :portfolioAssetId', {
        portfolioAssetId: getPortfolioAssetDividendsDto.portfolioAssetId
      })
      .orderBy('portfolioAssetDividend.date')
      .skip(page * limit)
      .take(limit);
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

  private calculateTaxes(asset: Asset, type: PortfolioAssetDividendTypes, quantity: number, value: number): number {
    let taxes = 0;

    if (type === PortfolioAssetDividendTypes.JCP || asset.currency === AssetCurrencies.USD) {
      const taxRate = asset.currency === AssetCurrencies.USD ? 0.3 : 0.15;
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
