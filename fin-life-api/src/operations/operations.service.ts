import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Operation, OperationTypes } from './operation.entity';
import { AssetsService } from '../assets/assets.service';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { FilesService } from '../files/files.service';
import { CurrencyHelper } from '../common/helpers/currency.helper';
import { CreateOperationDto, GetOperationsDto, ImportOperationsDto } from './operation.dto';
import { PortfolioAsset } from '../portfoliosAssets/portfolioAsset.entity';
import { Asset, AssetClasses } from '../assets/asset.entity';
import { OrderBy, GetRequestResponse } from '../common/dto/request';
import { DateHelper } from '../common/helpers/date.helper';
import { AssetHistoricalPricesService } from '../assetHistoricalPrices/assetHistoricalPrices.service';

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
  constructor(
    @InjectRepository(Operation) private readonly operationsRepository: Repository<Operation>,
    private readonly assetsService: AssetsService,
    private readonly portfoliosAssetsService: PortfoliosAssetsService,
    private readonly filesService: FilesService,
    private readonly assetHistoricalPricesService: AssetHistoricalPricesService,
    private readonly currencyHelper: CurrencyHelper,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(portfolioId: number, createOperationDto: CreateOperationDto): Promise<Operation> {
    const { quantity, assetId, price, type, date, institution, fees, taxes } = createOperationDto;
    let portfolioAsset = await this.findOpenPortfolioAsset(portfolioId, assetId);
    const asset = await this.assetsService.find(assetId, {
      relations: ['splitHistoricalEvents', 'dividendHistoricalPayments'],
      active: true
    });
    const priceToBeUsed =
      asset.class === AssetClasses.Cryptocurrency ? await this.getCryptoPriceInDollars(asset.id, date) : price;
    const total = quantity * priceToBeUsed - (fees || 0);
    const operation = new Operation(
      quantity,
      priceToBeUsed,
      type,
      date,
      institution,
      fees,
      taxes,
      total,
      0,
      asset.currency
    );
    const adjustedOperation = this.getAdjustedOperation(operation, asset);

    portfolioAsset = this.createOrUpdatePortfolioAsset(adjustedOperation, assetId, portfolioId, portfolioAsset);

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
    const { data: portfolioAssets } = await this.portfoliosAssetsService.get({ portfolioId });
    const fileContent = await this.filesService.readCsvFile<OperationCsvRow>(file);
    const operations: Operation[] = [];
    const newPortfoliosAssets: PortfolioAsset[] = [];

    await this.operationsRepository.manager.transaction(async (manager) => {
      for (const operationCsvRow of fileContent) {
        const asset = assets.find((asset) => asset.ticker === operationCsvRow.Asset);

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
          const adjustedOperation = this.getAdjustedOperation(operation, asset);

          portfolioAsset = this.createOrUpdatePortfolioAsset(adjustedOperation, asset.id, portfolioId, portfolioAsset);

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
    const adjustedOperation = this.getAdjustedOperation(operation, asset);

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

  public async getCryptoPriceInDollars(assetId: number, date: string): Promise<number> {
    const previousDate = this.dateHelper.subtractDays(new Date(date), 1);
    const [mostRecentPriceBeforeOperation] = await this.assetHistoricalPricesService.getMostRecent(
      [assetId],
      previousDate.toISOString()
    );

    return mostRecentPriceBeforeOperation.closingPrice;
  }

  public getAdjustedOperation(operation: Operation, asset: Asset): Operation {
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

  private async findOpenPortfolioAsset(portfolioId: number, assetId: number): Promise<PortfolioAsset> {
    const { data: portfoliosAssets } = await this.portfoliosAssetsService.get({ portfolioId, assetId, open: true });
    const [portfolioAsset] = portfoliosAssets;

    return portfolioAsset;
  }

  private createOrUpdatePortfolioAsset(
    adjustedOperation: Operation,
    assetId: number,
    portfolioId: number,
    portfolioAsset?: PortfolioAsset
  ): PortfolioAsset {
    if (portfolioAsset) {
      portfolioAsset.fees += adjustedOperation.fees;
      portfolioAsset.taxes += adjustedOperation.taxes;

      if (adjustedOperation.type === OperationTypes.Buy) {
        portfolioAsset.quantity += adjustedOperation.quantity;
        portfolioAsset.cost += adjustedOperation.total;
        portfolioAsset.adjustedCost += adjustedOperation.total;
        portfolioAsset.averageCost = portfolioAsset.adjustedCost / portfolioAsset.quantity;
      } else {
        if (adjustedOperation.quantity > portfolioAsset.quantity) {
          throw new ConflictException('Quantity is higher than the current position');
        }

        portfolioAsset.salesCost += adjustedOperation.quantity * portfolioAsset.averageCost;
        portfolioAsset.quantity -= adjustedOperation.quantity;
        portfolioAsset.adjustedCost = portfolioAsset.quantity * portfolioAsset.averageCost;
        portfolioAsset.salesTotal += adjustedOperation.total;
      }
    } else {
      if (adjustedOperation.type === OperationTypes.Sell) {
        throw new ConflictException('You are not positioned in this asset');
      }

      const cost = adjustedOperation.quantity * adjustedOperation.price;
      const averageCost = cost / adjustedOperation.quantity;

      portfolioAsset = new PortfolioAsset(
        assetId,
        portfolioId,
        adjustedOperation.quantity,
        cost,
        cost,
        averageCost,
        0,
        adjustedOperation.fees,
        adjustedOperation.taxes
      );
    }

    return portfolioAsset;
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
