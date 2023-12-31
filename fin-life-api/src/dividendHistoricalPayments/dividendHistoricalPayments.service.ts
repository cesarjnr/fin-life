import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { DividendHistoricalPayment } from './dividendHistoricalPayment.entity';
import { DateHelper } from '../common/helpers/date.helper';
import { Asset } from '../assets/asset.entity';
import { AssetDividend } from '../assetPricesProvider/assetDataProvider.service';

@Injectable()
export class DividendHistoricalPaymentsService {
  constructor(
    @InjectRepository(DividendHistoricalPayment)
    private readonly dividendHistoricalPaymentsRepository: Repository<DividendHistoricalPayment>,
    private readonly dateHelper: DateHelper
  ) {}

  public async create(asset: Asset, assetDividends: AssetDividend[], manager?: EntityManager): Promise<void> {
    const assetDividendHistoricalPayments = assetDividends.map((assetDividend) => {
      return new DividendHistoricalPayment(
        asset.id,
        this.dateHelper.format(new Date(assetDividend.date * 1000), 'yyyy-MM-dd'),
        assetDividend.amount
      );
    });

    if (manager) {
      await manager.save(assetDividendHistoricalPayments);
    } else {
      await this.dividendHistoricalPaymentsRepository.save(assetDividendHistoricalPayments);
    }
  }
}
