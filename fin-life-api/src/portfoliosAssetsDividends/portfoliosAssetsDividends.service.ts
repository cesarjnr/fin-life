import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetDividend } from './portfolioAssetDividend.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreatePortfolioAssetDividendDto, UpdatePortfolioAssetDividendDto } from './portfoliosAssetsDividends.dto';

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
    const { type, date, quantity, value, fees } = createPortfolioAssetDividendDto;
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId });
    const portfolioAssetDividend = new PortfolioAssetDividend(
      portfolioAssetId,
      type,
      date,
      quantity,
      value,
      fees,
      this.calculateTotalPayment(quantity, value, fees)
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

    portfolioAssetDividend.total = this.calculateTotalPayment(
      portfolioAssetDividend.quantity,
      portfolioAssetDividend.value,
      portfolioAssetDividend.fees
    );
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

  private calculateTotalPayment(quantity: number, value: number, fees?: number): number {
    return quantity * value - (fees || 0);
  }

  private async find(id: number): Promise<PortfolioAssetDividend> {
    const portfolioAssetDividend = await this.portfolioAssetDividendRepository.findOne({
      where: { id },
      relations: ['portfolioAsset']
    });

    if (!portfolioAssetDividend) {
      throw new NotFoundException('Dividend not found');
    }

    return portfolioAssetDividend;
  }
}
