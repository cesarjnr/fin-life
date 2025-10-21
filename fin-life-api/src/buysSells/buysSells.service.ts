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
import { DateHelper } from '../common/helpers/date.helper';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';

interface BuySellCsvRow {
  Action: BuySellTypes;
  Asset: string;
  Date: string;
  Fees: string;
  Taxes: string;
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
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(portfolioId: number, createBuySellDto: CreateBuySellDto): Promise<BuySell> {
    const { quantity, assetId, price, type, date, institution, fees, taxes } = createBuySellDto;
    const portfolio = await this.portfoliosService.find(portfolioId, ['buysSells'], {
      buysSells: { date: 'ASC' }
    });
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments']
    });
    const priceToBeUsed =
      asset.class === AssetClasses.Cryptocurrency ? await this.getCryptoPriceInDollars(asset.id, date) : price;
    const total = quantity * priceToBeUsed - (fees || 0);
    const buySell = new BuySell(
      quantity,
      priceToBeUsed,
      type,
      date,
      institution,
      asset.id,
      portfolio.id,
      fees,
      taxes,
      total,
      0,
      asset.currency
    );
    const adjustedBuySell = this.getAdjustedBuySell(buySell, asset);
    let portfolioAsset = await this.findPortfolioAsset(asset.id, portfolio.id);

    portfolioAsset = this.createOrUpdatePortfolioAsset(adjustedBuySell, asset, portfolio.id, portfolioAsset);

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
    const { data: assets } = await this.assetsService.get({
      id: importBuysSellsDto.assetId ? Number(importBuysSellsDto.assetId) : undefined,
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments']
    });
    const { data: portfolioAssets } = await this.portfoliosAssetsService.get({ portfolioId });
    const fileContent = await this.filesService.readCsvFile<BuySellCsvRow>(file);
    const buysSells: BuySell[] = [];
    const portfolioAssetsToSave: PortfolioAsset[] = [];

    for (const buySellCsvRow of fileContent) {
      const asset = assets.find((asset) => asset.ticker === buySellCsvRow.Asset);

      if (asset) {
        const portfolioAsset =
          portfolioAssets.find((portfolioAsset) => portfolioAsset.assetId === asset.id) ||
          portfolioAssetsToSave.find((portfolioAsset) => portfolioAsset.assetId === asset.id);
        const { Quantity, Price, Action, Date, Institution, Fees, Taxes } = buySellCsvRow;
        const parsedQuantity = parseFloat(Quantity.replace(',', '.'));
        const parsedPrice =
          asset.class === AssetClasses.Cryptocurrency
            ? await this.getCryptoPriceInDollars(asset.id, Date)
            : this.currencyHelper.parse(Price);
        const parsedFees =
          asset.class === AssetClasses.Cryptocurrency ? parseFloat(Fees) : this.currencyHelper.parse(Fees);
        const parsedTaxes =
          asset.class === AssetClasses.Cryptocurrency ? parseFloat(Taxes) : this.currencyHelper.parse(Taxes);
        const total = parsedQuantity * parsedPrice - (asset.class !== AssetClasses.Cryptocurrency ? parsedFees : 0);
        const buySell = new BuySell(
          parsedQuantity,
          parsedPrice,
          Action,
          Date,
          Institution,
          asset.id,
          portfolio.id,
          parsedFees,
          parsedTaxes,
          total,
          0,
          asset.currency
        );
        const adjustedBuySell = this.getAdjustedBuySell(buySell, asset);
        const portfolioAssetToSave = this.createOrUpdatePortfolioAsset(
          adjustedBuySell,
          asset,
          portfolio.id,
          portfolioAsset
        );

        buysSells.push(buySell);

        if (!portfolioAssetsToSave.find((portfolioAsset) => portfolioAsset.assetId === asset.id)) {
          portfolioAssetsToSave.push(portfolioAssetToSave);
        }
      }
    }

    await this.buysSellsRepository.manager.transaction(async (manager) => {
      await manager.save([...buysSells, ...portfolioAssetsToSave]);
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

  public async getCryptoPriceInDollars(assetId: number, date: string): Promise<number> {
    const previousDate = this.dateHelper.subtractDays(new Date(date), 1);
    const [mostRecentPriceBeforeOperation] = await this.assetHistoricalPricesService.getMostRecent(
      [assetId],
      previousDate.toISOString()
    );

    return mostRecentPriceBeforeOperation.closingPrice;
  }

  public getAdjustedBuySell(buySell: BuySell, asset: Asset): BuySell {
    const adjustedBuySell = Object.assign({}, buySell);
    const splitsAfterBuySellDate = asset.splitHistoricalEvents.filter(
      (split) => new Date(split.date).getTime() > new Date(buySell.date).getTime()
    );

    if (splitsAfterBuySellDate.length) {
      splitsAfterBuySellDate.forEach((split) => {
        const ratio = split.numerator / split.denominator;

        adjustedBuySell.quantity *= ratio;
        adjustedBuySell.price *= 1 / ratio;
        adjustedBuySell.total = adjustedBuySell.quantity * adjustedBuySell.price;
        // adjustedBuySell.quantity =
        //   asset.class === AssetClasses.Stock ? Math.round(adjustedBuySell.quantity) : adjustedBuySell.quantity;
      });
    }

    return adjustedBuySell;
  }

  private createOrUpdatePortfolioAsset(
    adjustedBuySell: BuySell,
    asset: Asset,
    portfolioId: number,
    portfolioAsset?: PortfolioAsset
  ): PortfolioAsset {
    if (portfolioAsset?.quantity > 0) {
      portfolioAsset.fees += adjustedBuySell.fees;
      portfolioAsset.taxes += adjustedBuySell.taxes;

      if (adjustedBuySell.type === BuySellTypes.Buy) {
        portfolioAsset.quantity += adjustedBuySell.quantity;
        portfolioAsset.cost += adjustedBuySell.total;
        portfolioAsset.adjustedCost += adjustedBuySell.total;
        portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
      } else {
        if (adjustedBuySell.quantity > portfolioAsset.quantity) {
          throw new ConflictException('Quantity is higher than the current position');
        }

        portfolioAsset.quantity -= adjustedBuySell.quantity;
        portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
        portfolioAsset.salesTotal += adjustedBuySell.total;
      }
    } else {
      if (adjustedBuySell.type === BuySellTypes.Sell) {
        throw new ConflictException('You are not positioned in this asset');
      }

      const cost = adjustedBuySell.quantity * adjustedBuySell.price;
      const averageCost = cost / adjustedBuySell.quantity;

      portfolioAsset = new PortfolioAsset(
        asset.id,
        portfolioId,
        adjustedBuySell.quantity,
        cost,
        cost,
        averageCost,
        0,
        adjustedBuySell.fees,
        adjustedBuySell.taxes
      );
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
