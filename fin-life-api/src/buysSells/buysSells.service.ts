import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BuySell, BuySellTypes } from './buySell.entity';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { AssetsService } from '../assets/assets.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { CreateBuySellDto, GetBuysSellsDto, ImportBuysSellsDto } from './buysSells.dto';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { Asset, AssetClasses } from '../assets/asset.entity';
import { OrderBy, GetRequestResponse } from '../common/dto/request';

interface BuySellCsvRow {
  Action: BuySellTypes;
  Asset: string;
  Date: string;
  Fees: string;
  Institution: string;
  Price: string;
  Quantity: string;
  Total: string;
}

@Injectable()
export class BuysSellsService {
  constructor(
    @InjectRepository(BuySell) private readonly buysSellsRepository: Repository<BuySell>,
    private readonly portfoliosService: PortfoliosService,
    private readonly assetsService: AssetsService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly filesService: FilesService,
    private readonly currencyHelper: CurrencyHelper
  ) {}

  public async create(portfolioId: number, createBuySellDto: CreateBuySellDto): Promise<BuySell> {
    const { quantity, assetId, price, type, date, institution, fees } = createBuySellDto;
    const portfolio = await this.portfoliosService.find(portfolioId, ['buysSells'], {
      buysSells: { date: 'ASC' }
    });
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments']
    });
    const total = quantity * price - (fees || 0);
    const buySell = new BuySell(
      quantity,
      price,
      type,
      date,
      institution,
      asset.id,
      portfolio.id,
      fees,
      total,
      0,
      asset.currency
    );
    const adjustedBuySell = this.getAdjustedBuySell(buySell, asset);
    let portfolioAsset = await this.findPortfolioAsset(asset.id, portfolio.id);

    portfolioAsset = this.createOrUpdatePortfolioAsset(adjustedBuySell, asset.id, portfolio.id, portfolioAsset);

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([buySell, portfolioAsset]);
    });

    return buySell;
  }

  public async import(
    portfolioId: number,
    file: Express.Multer.File,
    importBuysSellsDto: ImportBuysSellsDto
  ): Promise<BuySell[]> {
    const portfolio = await this.portfoliosService.find(portfolioId, ['buysSells'], { buysSells: { date: 'ASC' } });
    const asset = await this.findAsset(Number(importBuysSellsDto.assetId));
    const fileContent = await this.filesService.readCsvFile<BuySellCsvRow>(file);
    const buysSells: BuySell[] = [];
    let portfolioAsset = await this.findPortfolioAsset(asset.id, portfolio.id);

    for (const buySellCsvRow of fileContent) {
      if (buySellCsvRow.Asset === asset.ticker) {
        const { Quantity, Price, Action, Date, Institution, Fees } = buySellCsvRow;
        const parsedQuantity = parseFloat(Quantity.replace(',', '.'));
        const parsedPrice = this.currencyHelper.parse(Price);
        const parsedFees = this.currencyHelper.parse(Fees);
        const total = parsedQuantity * parsedPrice - parsedFees;
        const buySell = new BuySell(
          parsedQuantity,
          parsedPrice,
          Action,
          Date,
          Institution,
          asset.id,
          portfolio.id,
          parsedFees,
          total,
          0,
          asset.currency
        );
        const adjustedBuySell = this.getAdjustedBuySell(buySell, asset);

        portfolioAsset = this.createOrUpdatePortfolioAsset(adjustedBuySell, asset.id, portfolio.id, portfolioAsset);

        buysSells.push(buySell);
      }
    }

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([...buysSells, portfolioAsset]);
    });

    return buysSells;
  }

  public async get(getBuysSellsDto?: GetBuysSellsDto): Promise<GetRequestResponse<BuySell>> {
    const page: number | null = getBuysSellsDto?.page ? Number(getBuysSellsDto.page) : null;
    const limit: number | null =
      getBuysSellsDto?.limit && getBuysSellsDto.limit !== '0' ? Number(getBuysSellsDto.limit) : null;
    const orderByColumn = `buySell.${getBuysSellsDto.orderByColumn ?? 'date'}`;
    const orderBy = getBuysSellsDto.orderBy ?? OrderBy.Asc;
    const builder = this.buysSellsRepository
      .createQueryBuilder('buySell')
      .leftJoinAndSelect('buySell.asset', 'asset')
      .where('buySell.portfolio_id = :portfolioId', { portfolioId: getBuysSellsDto.portfolioId })
      .orderBy(orderByColumn, orderBy);

    if (getBuysSellsDto.relations?.length) {
      getBuysSellsDto.relations.forEach((relation) => {
        builder.leftJoinAndSelect(relation, relation.split('.').pop());
      });
    }

    if (getBuysSellsDto.assetId) {
      builder.andWhere('buySell.asset_id = :assetId', { assetId: Number(getBuysSellsDto.assetId) });
    }

    if (getBuysSellsDto.start) {
      builder.andWhere('buySell.date >= :start', { start: getBuysSellsDto.start });
    }

    if (getBuysSellsDto.end) {
      builder.andWhere('buySell.date <= :end', { end: getBuysSellsDto.end });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const buysSells = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: buysSells,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async delete(id: number): Promise<void> {
    const buySell = await this.find(id);
    const portfolioAsset = await this.findPortfolioAsset(buySell.assetId, buySell.portfolioId, [
      'asset.splitHistoricalEvents'
    ]);
    const adjustedBuySell = this.getAdjustedBuySell(buySell, portfolioAsset.asset);

    this.undoOperation(portfolioAsset, adjustedBuySell);

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      if (portfolioAsset.quantity === 0) {
        await manager.remove(portfolioAsset);
      } else {
        await manager.save(portfolioAsset);
      }

      await manager.remove(buySell);
    });
  }

  public getAdjustedBuySell(buySell: BuySell, asset: Asset): BuySell {
    const adjustedBuySell = Object.assign({}, buySell);
    const splitsAfterBuySellDate = asset.splitHistoricalEvents.filter(
      (split) => new Date(split.date).getTime() > new Date(buySell.date).getTime()
    );

    if (splitsAfterBuySellDate.length) {
      splitsAfterBuySellDate.forEach((split) => {
        adjustedBuySell.price = (adjustedBuySell.price / split.numerator) * split.denominator;
        adjustedBuySell.quantity = (adjustedBuySell.quantity * split.numerator) / split.denominator;
        adjustedBuySell.total = adjustedBuySell.quantity * adjustedBuySell.price;
        adjustedBuySell.quantity =
          asset.class === AssetClasses.Stock ? Math.round(adjustedBuySell.quantity) : adjustedBuySell.quantity;
      });
    }

    return adjustedBuySell;
  }

  private createOrUpdatePortfolioAsset(
    adjustedBuySell: BuySell,
    assetId: number,
    portfolioId: number,
    portfolioAsset?: PortfolioAsset
  ): PortfolioAsset {
    if (portfolioAsset?.quantity > 0) {
      if (adjustedBuySell.type === BuySellTypes.Buy) {
        portfolioAsset.quantity += adjustedBuySell.quantity;
        portfolioAsset.cost += adjustedBuySell.total + (adjustedBuySell.fees || 0);
        portfolioAsset.adjustedCost += adjustedBuySell.total + (adjustedBuySell.fees || 0);
        portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
      } else {
        if (adjustedBuySell.quantity > portfolioAsset.quantity) {
          throw new ConflictException('Quantity is higher than the current position');
        }

        portfolioAsset.quantity -= adjustedBuySell.quantity;
        portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
        portfolioAsset.salesTotal += adjustedBuySell.total - (adjustedBuySell.fees || 0);
      }
    } else {
      if (adjustedBuySell.type === BuySellTypes.Sell) {
        throw new ConflictException('You are not positioned in this asset');
      }

      const cost = adjustedBuySell.quantity * adjustedBuySell.price;
      const averageCost = cost / adjustedBuySell.quantity;

      portfolioAsset = new PortfolioAsset(assetId, portfolioId, adjustedBuySell.quantity, cost, cost, averageCost, 0);
    }

    return portfolioAsset;
  }

  private async findPortfolioAsset(
    assetId: number,
    portfolioId: number,
    relations?: string[]
  ): Promise<PortfolioAsset> {
    let portfolioAsset: PortfolioAsset;

    try {
      portfolioAsset = await this.portfoliosAssetsService.find({
        assetId,
        portfolioId,
        relations
      });
    } catch {
      portfolioAsset = undefined;
    }

    return portfolioAsset;
  }

  private async findAsset(assetId: number): Promise<Asset> {
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments']
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  private async find(id: number): Promise<BuySell> {
    const buySell = await this.buysSellsRepository.findOneBy({ id });

    if (!buySell) {
      throw new NotFoundException('Operation not found');
    }

    return buySell;
  }

  private undoOperation(portfolioAsset: PortfolioAsset, adjustedBuySell: BuySell): void {
    if (adjustedBuySell.type === BuySellTypes.Buy) {
      portfolioAsset.quantity -= adjustedBuySell.quantity;
      portfolioAsset.cost -= adjustedBuySell.quantity * adjustedBuySell.price;
      portfolioAsset.adjustedCost -= adjustedBuySell.quantity * adjustedBuySell.price;
      portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
    } else {
      portfolioAsset.quantity += adjustedBuySell.quantity;
      portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
      portfolioAsset.salesTotal -= adjustedBuySell.quantity * adjustedBuySell.price - (adjustedBuySell.fees || 0);
    }
  }
}
