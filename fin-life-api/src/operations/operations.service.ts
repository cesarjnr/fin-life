import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Operation, OperationTypes } from './operation.entity';
import { AssetsService } from '../assets/assets.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { DateHelper } from '../common/helpers/date.helper';
import { CreateOperationDto, GetOperationsDto, ImportOperationsDto } from './operation.dto';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { Asset, AssetClasses } from '../assets/asset.entity';
import { OrderBy, GetRequestResponse } from '../common/dto/request';

interface OperationCsvRow {
  Action: OperationTypes;
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
export class OperationsService {
  private readonly logger = new Logger(OperationsService.name);

  constructor(
    @InjectRepository(Operation) private readonly operationsRepository: Repository<Operation>,
    private readonly assetsService: AssetsService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly filesService: FilesService,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(portfolioId: number, createOperationDto: CreateOperationDto): Promise<Operation> {
    const { assetId } = createOperationDto;

    this.logger.log(`[create] Creating operation for portfolio ${portfolioId} and asset ${assetId}`);

    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments'],
      active: true
    });

    this.validateOperation(asset, createOperationDto);

    const price = await this.getOperationAssetPrice(asset, createOperationDto);
    const total = this.getOperationTotalValue(asset, createOperationDto, price);
    const quantity = this.getOperationQuantity(asset, createOperationDto, price, total);
    const operation = new Operation(
      quantity,
      price,
      createOperationDto.type,
      createOperationDto.date,
      createOperationDto.institution,
      createOperationDto.fees || 0,
      createOperationDto.taxes,
      total,
      0,
      asset.currency
    );
    const adjustedOperation = this.adjustOperationBySplitsAndGroupings(operation, asset);
    let portfolioAsset = await this.findOpenPortfolioAsset(portfolioId, assetId);

    portfolioAsset = await this.createOrUpdatePortfolioAsset(adjustedOperation, asset, portfolioId, portfolioAsset);

    await this.operationsRepository.manager.transaction(async (manager) => {
      await manager.save(portfolioAsset);

      operation.portfolioAssetId = portfolioAsset.id;

      await manager.save(operation);
    });

    return operation;
  }

  public async import(
    portfolioId: number,
    file: Express.Multer.File,
    importOperationsDto: ImportOperationsDto
  ): Promise<Operation[]> {
    const { assetId } = importOperationsDto;
    const { data: assets } = await this.assetsService.get({
      id: assetId ? Number(assetId) : undefined,
      active: true,
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments']
    });
    const { data: portfolioAssets } = await this.portfoliosAssetsService.get({ portfolioId, open: true });
    const fileContent = await this.filesService.readCsvFile<OperationCsvRow>(file);
    const operations: Operation[] = [];
    const newPortfoliosAssets: PortfolioAsset[] = [];

    await this.operationsRepository.manager.transaction(async (manager) => {
      for (const operationCsvRow of fileContent) {
        const asset = assets.find((asset) => asset.code === operationCsvRow.Asset);

        if (asset) {
          let portfolioAsset =
            portfolioAssets.find((portfolioAsset) => portfolioAsset.assetId === asset.id) ||
            newPortfoliosAssets.find((portfolioAsset) => portfolioAsset.assetId === asset.id);
          const { Quantity, Price, Action, Date, Institution, Fees, Taxes } = operationCsvRow;
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
          const operation = new Operation(
            parsedQuantity,
            parsedPrice,
            Action,
            Date,
            Institution,
            parsedFees,
            parsedTaxes,
            total,
            0,
            asset.currency
          );
          const adjustedOperation = this.adjustOperationBySplitsAndGroupings(operation, asset);

          if (portfolioAsset) {
            portfolioAsset.asset = asset;
          }

          portfolioAsset = await this.createOrUpdatePortfolioAsset(
            adjustedOperation,
            asset,
            portfolioId,
            portfolioAsset
          );

          if (!portfolioAsset.id) {
            newPortfoliosAssets.push(portfolioAsset);
          }

          await manager.save(portfolioAsset);

          operation.portfolioAssetId = portfolioAsset.id;

          operations.push(operation);
        }
      }

      await manager.save(operations);
    });

    return operations;
  }

  public async get(getOperationsDto?: GetOperationsDto): Promise<GetRequestResponse<Operation>> {
    const page: number | null = getOperationsDto?.page ? Number(getOperationsDto.page) : null;
    const limit: number | null =
      getOperationsDto?.limit && getOperationsDto.limit !== '0' ? Number(getOperationsDto.limit) : null;
    const orderByColumn = `operation.${getOperationsDto.orderByColumn ?? 'date'}`;
    const orderBy = getOperationsDto.orderBy ?? OrderBy.Asc;
    const builder = this.operationsRepository
      .createQueryBuilder('operation')
      .leftJoinAndSelect('operation.portfolioAsset', 'portfolioAsset')
      .leftJoinAndSelect('portfolioAsset.asset', 'asset')
      .orderBy(orderByColumn, orderBy);

    if (getOperationsDto.portfolioAssetId) {
      builder.andWhere('portfolioAsset.id = :portfolioAssetId', {
        portfolioAssetId: Number(getOperationsDto.portfolioAssetId)
      });
    }

    if (getOperationsDto.portfolioId) {
      builder.andWhere('portfolioAsset.portfolio_id = :portfolioId', {
        portfolioId: Number(getOperationsDto.portfolioId)
      });
    }

    if (getOperationsDto.assetId) {
      builder.andWhere('portfolioAsset.asset_id = :assetId', { assetId: Number(getOperationsDto.assetId) });
    }

    if (getOperationsDto.start) {
      builder.andWhere('operation.date >= :start', { start: getOperationsDto.start });
    }

    if (getOperationsDto.end) {
      builder.andWhere('operation.date <= :end', { end: getOperationsDto.end });
    }

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const operations = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: operations,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async delete(id: number): Promise<void> {
    const operation = await this.find(id);
    const asset = await this.assetsService.find(operation.portfolioAsset.assetId, {
      relations: ['splitHistoricalEvents']
    });
    const adjustedOperation = this.adjustOperationBySplitsAndGroupings(operation, asset);

    this.undoOperation(operation.portfolioAsset, adjustedOperation);

    await this.operationsRepository.manager.transaction(async (manager) => {
      if (operation.portfolioAsset.quantity === 0) {
        await manager.remove(operation.portfolioAsset);
      } else {
        await manager.save(operation.portfolioAsset);
      }

      await manager.remove(operation);
    });
  }

  public async find(id: number): Promise<Operation> {
    const operation = await this.operationsRepository.findOne({ where: { id }, relations: ['portfolioAsset.asset'] });

    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    return operation;
  }

  public adjustOperationBySplitsAndGroupings(operation: Operation, asset: Asset): Operation {
    this.logger.log(`[adjustOperationBySplitsAndGroupings] Adjusting operation based on splits...`);

    const adjustedOperation = Object.assign({}, operation);
    const splitsAfterOperation = asset.splitHistoricalEvents.filter(
      (split) => new Date(split.date).getTime() > new Date(adjustedOperation.date).getTime()
    );

    if (splitsAfterOperation.length) {
      splitsAfterOperation.forEach((split) => {
        const ratio = split.numerator / split.denominator;

        adjustedOperation.quantity *= ratio;
        adjustedOperation.price *= 1 / ratio;
        adjustedOperation.total = adjustedOperation.quantity * adjustedOperation.price;
      });
    }

    return adjustedOperation;
  }

  private validateOperation(asset: Asset, createOperationDto: CreateOperationDto): void {
    const { total, quantity, price, type } = createOperationDto;

    if (type === OperationTypes.Sell && asset.index && !total) {
      throw new BadRequestException({
        message: ['total must be a number conforming to the specified constraints'],
        error: 'Bad Request',
        statusCode: 400
      });
    }

    if (!asset.index && (!quantity || !price)) {
      throw new BadRequestException({
        message: [
          !quantity ? 'quantity must be a number conforming to the specified constraints' : undefined,
          !price ? 'price must be a number conforming to the specified constraints' : undefined
        ].filter((message) => message),
        error: 'Bad Request',
        statusCode: 400
      });
    }
  }

  private async getOperationAssetPrice(asset: Asset, createOperationDto: CreateOperationDto): Promise<number> {
    let price = createOperationDto.price;

    if (asset.class === AssetClasses.Cryptocurrency) {
      price = await this.getCryptoPriceInDollars(asset.id, createOperationDto.date);
    } else if (asset.index) {
      const assetHistoricalPrice = await this.assetHistoricalPricesService.find({
        date: this.dateHelper.format(this.dateHelper.subtractDays(new Date(createOperationDto.date), 1), 'yyyy-MM-dd')
      });

      price = assetHistoricalPrice.closingPrice;
    }

    return price;
  }

  private getOperationTotalValue(asset: Asset, createOperationDto: CreateOperationDto, price: number): number {
    let total = createOperationDto.total;
    const feesToBeUsed = asset.class !== AssetClasses.Cryptocurrency ? createOperationDto.fees : 0;

    if (!asset.index) {
      total = createOperationDto.quantity * price;
    }

    return total - feesToBeUsed;
  }

  private getOperationQuantity(
    asset: Asset,
    createOperationDto: CreateOperationDto,
    price: number,
    total: number
  ): number {
    let quantity = createOperationDto.quantity;

    if (asset.index) {
      quantity = total / price;
    }

    return quantity;
  }

  private async getCryptoPriceInDollars(assetId: number, date: string): Promise<number> {
    this.logger.log(`[getCryptoPriceInDollars] Getting most recent price in dollars for asset ${assetId}...`);

    const previousDate = this.dateHelper.subtractDays(new Date(date), 1);
    const [mostRecentPriceBeforeOperation] = await this.assetHistoricalPricesService.getMostRecent(
      [assetId],
      previousDate.toISOString()
    );

    return mostRecentPriceBeforeOperation.closingPrice;
  }

  private async findOpenPortfolioAsset(portfolioId: number, assetId: number): Promise<PortfolioAsset> {
    this.logger.log(
      `[findOpenPortfolioAsset] Finding open portfolio asset for portfolio ${portfolioId} and asset ${assetId}...`
    );

    const { data: portfoliosAssets } = await this.portfoliosAssetsService.get({ portfolioId, assetId, open: true });
    const [portfolioAsset] = portfoliosAssets;

    return portfolioAsset;
  }

  private async createOrUpdatePortfolioAsset(
    adjustedOperation: Operation,
    asset: Asset,
    portfolioId: number,
    portfolioAsset?: PortfolioAsset
  ): Promise<PortfolioAsset> {
    const operationForPortfolioAssetCalc = await this.adjustOperationForPortfolioAssetCalc(adjustedOperation, asset);

    if (portfolioAsset) {
      this.updatePortfolioAsset(portfolioAsset, operationForPortfolioAssetCalc);
    } else {
      portfolioAsset = this.createPortfolioAsset(operationForPortfolioAssetCalc, asset.id, portfolioId);
    }

    return portfolioAsset;
  }

  private async adjustOperationForPortfolioAssetCalc(operation: Operation, asset: Asset): Promise<Operation> {
    this.logger.log('[adjustOperationForPortfolioAssetCal] Adjusting operation...');

    const operationForPortfolioAssetCalc = Object.assign({}, operation);

    if (asset.index) {
      operationForPortfolioAssetCalc.price = await this.getAssetPrice(asset.id, operation.date);
      operationForPortfolioAssetCalc.quantity = operation.total / operationForPortfolioAssetCalc.price;
    }

    return operationForPortfolioAssetCalc;
  }

  private async getAssetPrice(assetId: number, operationDate: string): Promise<number> {
    this.logger.log('[getIndexPrice] Getting index price...');

    const dayBefore = this.dateHelper.subtractDays(new Date(operationDate), 1);
    const [priceBeforeOperationDate] = await this.assetHistoricalPricesService.getMostRecent(
      [assetId],
      dayBefore.toISOString()
    );

    return priceBeforeOperationDate.closingPrice;
  }

  private updatePortfolioAsset(portfolioAsset: PortfolioAsset, operation: Operation): void {
    this.logger.log('[updatePortfolioAsset] Updating portfolio asset...');

    portfolioAsset.fees += operation.fees;
    portfolioAsset.taxes += operation.taxes;

    if (operation.type === OperationTypes.Buy) {
      this.updatePortfolioAssetBasedOnBuyOperation(portfolioAsset, operation);
    } else {
      this.updatePortfolioAssetBasedOnSellOperation(portfolioAsset, operation);
    }
  }

  private updatePortfolioAssetBasedOnBuyOperation(portfolioAsset: PortfolioAsset, operation: Operation): void {
    portfolioAsset.quantity +=
      operation.quantity - (portfolioAsset.asset.class === AssetClasses.Cryptocurrency ? operation.fees : 0);
    portfolioAsset.cost += operation.total;
    portfolioAsset.adjustedCost += operation.total;
    portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
  }

  private updatePortfolioAssetBasedOnSellOperation(portfolioAsset: PortfolioAsset, operation: Operation): void {
    if (operation.quantity > portfolioAsset.quantity) {
      throw new ConflictException('Quantity is higher than the current position');
    }

    portfolioAsset.salesCost += operation.quantity * portfolioAsset.averageCost;
    portfolioAsset.quantity -= operation.quantity;

    if (portfolioAsset.asset.class === AssetClasses.Cryptocurrency) {
      portfolioAsset.quantity -= operation.fees;
    }

    portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
    portfolioAsset.salesTotal += operation.total;
  }

  private createPortfolioAsset(operation: Operation, assetId: number, portfolioId: number): PortfolioAsset {
    this.logger.log('[createPortfolioAsset] Creating portfolio asset...');

    if (operation.type === OperationTypes.Sell) {
      throw new ConflictException('You are not positioned in this asset');
    }

    const cost = operation.quantity * operation.price;
    const averageCost = cost / operation.quantity;

    return new PortfolioAsset(
      assetId,
      portfolioId,
      operation.quantity,
      cost,
      cost,
      averageCost,
      0,
      operation.fees,
      operation.taxes
    );
  }

  private undoOperation(portfolioAsset: PortfolioAsset, adjustedOperation: Operation): void {
    if (adjustedOperation.type === OperationTypes.Buy) {
      portfolioAsset.quantity -= adjustedOperation.quantity;
      portfolioAsset.cost -= adjustedOperation.quantity * adjustedOperation.price;
      portfolioAsset.adjustedCost -= adjustedOperation.quantity * adjustedOperation.price;
      portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
    } else {
      portfolioAsset.quantity += adjustedOperation.quantity;
      portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
      portfolioAsset.salesTotal -= adjustedOperation.quantity * adjustedOperation.price - (adjustedOperation.fees || 0);
    }
  }
}
