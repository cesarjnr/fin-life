import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { DividendHistoricalPaymentsService } from '../../../../../core/services/dividend-historical-payments.service';
import { DividendHistoricalPayment } from '../../../../../core/dtos/dividend-historical-payment.dto';
import { formatCurrency } from '../../../../../shared/utils/number';
import { GetRequestParams } from '../../../../../core/dtos/request';
import {
  PaginatorConfig,
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';

interface DividendHistoricalPaymentRowData {
  date: string;
  value: string;
}

@Component({
  selector: 'app-product-dividends',
  imports: [TableComponent],
  templateUrl: './product-dividends.component.html',
})
export class ProductDividendsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dividendHistoricalPaymentsService = inject(
    DividendHistoricalPaymentsService,
  );
  private readonly dividendHistoricalPayments = signal<
    DividendHistoricalPayment[]
  >([]);

  public readonly tableData: Signal<DividendHistoricalPaymentRowData[]> =
    computed(() =>
      this.dividendHistoricalPayments().map((dividendHistoricalPayment) => ({
        date: dividendHistoricalPayment.date,
        value: formatCurrency(
          dividendHistoricalPayment.asset.currency,
          dividendHistoricalPayment.value,
        ),
      })),
    );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'date', value: 'Data' },
    { key: 'value', value: 'Valor' },
  ];

  public ngOnInit(): void {
    this.getProductDividends();
  }

  public handlePageClick(event: PageEvent): void {
    this.getProductDividends({ limit: event.pageSize, page: event.pageIndex });
  }

  private getProductDividends(paginationParams?: GetRequestParams): void {
    const assetId = Number(this.activatedRoute.snapshot.paramMap.get('id')!);
    const params = paginationParams ?? { limit: 10, page: 0 };

    this.dividendHistoricalPaymentsService.get(assetId, params).subscribe({
      next: (getDividendHistoricalPaymentsResponse) => {
        const { data, total, page, itemsPerPage } =
          getDividendHistoricalPaymentsResponse;

        this.dividendHistoricalPayments.set(data);
        this.paginatorConfig.set({
          length: total,
          pageIndex: page!,
          pageSize: itemsPerPage!,
        });
      },
    });
  }
}
