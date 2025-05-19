import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetDividend, PortfolioAssetDividendTypes } from './portfolioAssetDividend.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreatePortfolioAssetDividendDto, UpdatePortfolioAssetDividendDto } from './portfoliosAssetsDividends.dto';
import { Asset, AssetCurrencies } from '../assets/asset.entity';

@Injectable()
export class PortfoliosAssetsDividendsService {
  constructor(
    @InjectRepository(PortfolioAssetDividend)
    private readonly portfolioAssetDividendRepository: Repository<PortfolioAssetDividend>,
    private readonly portfoliosAssetsService: PortfoliosAssetsService
  ) {}

  public async create(
    portfolioAssetId: number,
    createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    const { type, date, quantity, value } = createPortfolioAssetDividendDto;
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId, relations: ['asset'] });
    const taxes = this.calculateTaxes(portfolioAsset.asset, createPortfolioAssetDividendDto);
    const total = quantity * value - taxes;
    const portfolioAssetDividend = new PortfolioAssetDividend(
      portfolioAssetId,
      type,
      date,
      quantity,
      value,
      taxes,
      total
    );

    portfolioAsset.dividendsPaid += portfolioAssetDividend.total;

    return await this.portfolioAssetDividendRepository.manager.transaction(async (manager) => {
      await manager.save([portfolioAssetDividend, portfolioAsset]);

      return portfolioAssetDividend;
    });
  }

  public async get(portfolioAssetId: number): Promise<PortfolioAssetDividend[]> {
    const portfolioAsset = await this.portfoliosAssetsService.find({
      id: portfolioAssetId,
      order: { asset: { assetHistoricalPrices: { date: 'DESC' } } }
    });
    const portfoliosAssetsDividends = await this.portfolioAssetDividendRepository.find({
      where: { portfolioAssetId: portfolioAssetId },
      order: { date: 'ASC' }
    });

    return portfoliosAssetsDividends.map((portfolioAssetDividend) => {
      portfolioAssetDividend.portfolioAsset = portfolioAsset;

      return portfolioAssetDividend;
    });
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
      portfolioAssetDividend
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

  private calculateTaxes(asset: Asset, createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto): number {
    const { type, quantity, value } = createPortfolioAssetDividendDto;
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
