import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { PortfolioAssetDividend } from './portfolioAssetDividend.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreatePortfolioAssetDividendDto } from './portfoliosAssetsDividends.dto';

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
    const { type, date, sharesAmount, value, fees } = createPortfolioAssetDividendDto;
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId });
    const portfolioAssetDividend = new PortfolioAssetDividend(portfolioAssetId, type, date, sharesAmount, value, fees);

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
      where: { portfolioAssetId: portfolioAssetId }
    });

    return portfoliosAssetsDividends.map((portfolioAssetDividend) => {
      portfolioAssetDividend.portfolioAsset = portfolioAsset;

      return portfolioAssetDividend;
    });
  }
}
