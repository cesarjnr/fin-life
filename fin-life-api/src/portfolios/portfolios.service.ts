import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';

import { Portfolio } from './portfolio.entity';
import { UsersService } from '../users/users.service';
import { PutPorfolioDto } from './portfolio.dto';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfoliosRepository: Repository<Portfolio>,
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService
  ) {}

  public async create(userId: number, createPortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    const user = await this.usersService.find({ id: userId, relations: ['portfolios'] });
    const portfolio = new Portfolio(createPortfolioDto.description, user.id, createPortfolioDto.default);

    this.validateDefaultPortfolio(user.portfolios, portfolio);
    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }

  public async get(userId: number): Promise<Portfolio[]> {
    const portfolios = await this.portfoliosRepository.find({ where: { userId } });

    return portfolios;
  }

  public async find(
    portfolioId: number,
    relations?: string[],
    order?: FindOptionsOrder<Portfolio>
  ): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findOne({
      order,
      relations,
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const { data: assets } = await this.assetsService.get();

    portfolio.portfolioAssets?.forEach((porttfolioAsset) => {
      porttfolioAsset.asset = assets.find((asset) => asset.id === porttfolioAsset.assetId);
    });

    return portfolio;
  }

  public async update(portfolioId: number, updatePortfolioDto: PutPorfolioDto): Promise<Portfolio> {
    const portfolio = await this.find(portfolioId);

    this.portfoliosRepository.merge(portfolio, updatePortfolioDto);
    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }

  public async delete(portfolioId: number): Promise<void> {
    await this.find(portfolioId);
    await this.portfoliosRepository.delete(portfolioId);
  }

  private validateDefaultPortfolio(portfolios: Portfolio[], newPortfolio: Portfolio): void {
    const existingDefaultPortfolio = portfolios.find((portfolio) => portfolio.default);

    if (newPortfolio.default && existingDefaultPortfolio) {
      throw new ConflictException('There is already a default portfolio');
    }
  }
}
