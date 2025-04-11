import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BuySell, BuySellTypes } from './buySell.entity';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { AssetsService } from '../assets/assets.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreateBuySellDto } from './buysSells.dto';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { Asset } from '../assets/asset.entity';
import { PaginationParams, PaginationResponse } from '../common/dto/pagination';

type GetBuysSellsParams = PaginationParams & { portfolioId: number; assetId?: number };

@Injectable()
export class BuysSellsService {
  constructor(
    @InjectRepository(BuySell) private readonly buysSellsRepository: Repository<BuySell>,
    private readonly portfoliosService: PortfoliosService,
    private readonly assetsService: AssetsService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService
  ) {}

  public async create(portfolioId: number, createBuySellDto: CreateBuySellDto): Promise<BuySell> {
    const portfolio = await this.portfoliosService.find(portfolioId, ['buysSells'], {
      buysSells: { date: 'ASC' }
    });
    const { quantity, assetId, price, type, date, institution, fees } = createBuySellDto;
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments']
    });
    const buySell = new BuySell(quantity, price, type, date, institution, asset.id, portfolio.id, fees);
    const adjustedBuySell = this.getAdjustedBuySell(buySell, asset);
    const portfolioAsset = await this.createOrUpdatePortfolioAsset(portfolioId, asset.id, adjustedBuySell);

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, portfolioAsset]);
    });

    buySell.asset = asset;

    return buySell;
  }

  public async get(params: GetBuysSellsParams): Promise<PaginationResponse<BuySell>> {
    const where = { portfolioId: params.portfolioId };

    if (params.assetId) {
      Object.defineProperty(where, 'assetId', { value: params.assetId });
    }

    const page = Number(params?.page || 0);
    const limit = params?.limit && params.limit !== '0' ? Number(params.limit) : 10;
    const builder = this.buysSellsRepository
      .createQueryBuilder('buySell')
      .where(where)
      .leftJoinAndSelect('buySell.asset', 'asset')
      .orderBy('buySell.date')
      .skip(page * limit)
      .take(limit);
    const buysSells = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: buysSells,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public getAdjustedBuySell(buySell: BuySell, asset: Asset): BuySell {
    const adjustedBuySell = Object.assign({}, buySell);
    const splitsAfterBuySellDate = asset.splitHistoricalEvents.filter(
      (split) => new Date(split.date).getTime() > new Date(buySell.date).getTime()
    );

    if (splitsAfterBuySellDate.length) {
      let adjustedQuantity = buySell.quantity;
      let adjustedPrice = buySell.price;

      splitsAfterBuySellDate.forEach((split) => {
        adjustedQuantity = Math.round((adjustedQuantity * split.numerator) / split.denominator);
        adjustedPrice = (adjustedPrice / split.numerator) * split.denominator;
      });

      adjustedBuySell.quantity = adjustedQuantity;
      adjustedBuySell.price = adjustedPrice;
    }

    return adjustedBuySell;
  }

  private async createOrUpdatePortfolioAsset(
    portfolioId: number,
    assetId: number,
    adjustedBuySell: BuySell
  ): Promise<PortfolioAsset> {
    let portfolioAsset = await this.portfoliosAssetsService.find({
      assetId,
      portfolioId,
      order: { asset: { assetHistoricalPrices: { date: 'DESC' } } }
    });

    if (portfolioAsset) {
      if (adjustedBuySell.type === BuySellTypes.Buy) {
        portfolioAsset.quantity += adjustedBuySell.quantity;
        portfolioAsset.cost += adjustedBuySell.quantity * adjustedBuySell.price;
        portfolioAsset.adjustedCost = portfolioAsset.cost;
        portfolioAsset.averageCost =
          (portfolioAsset.adjustedCost + (adjustedBuySell.fees || 0)) / portfolioAsset.quantity;
      } else {
        if (adjustedBuySell.quantity > portfolioAsset.quantity) {
          throw new ConflictException('Quantity is higher than the current position');
        }

        portfolioAsset.quantity -= adjustedBuySell.quantity;
        portfolioAsset.adjustedCost =
          portfolioAsset.quantity === 0 ? 0 : portfolioAsset.quantity * portfolioAsset.averageCost;
        portfolioAsset.salesTotal += adjustedBuySell.quantity * adjustedBuySell.price - (adjustedBuySell.fees || 0);

        if (portfolioAsset.quantity === 0) {
          portfolioAsset.averageCost = 0;
        }
      }
    } else {
      if (adjustedBuySell.type === BuySellTypes.Sell) {
        new ConflictException('You are not positioned in this asset');
      }

      const cost = adjustedBuySell.quantity * adjustedBuySell.price;
      const averageCost = cost / adjustedBuySell.quantity;

      portfolioAsset = new PortfolioAsset(assetId, portfolioId, adjustedBuySell.quantity, cost, cost, averageCost);
    }

    return portfolioAsset;
  }
}
