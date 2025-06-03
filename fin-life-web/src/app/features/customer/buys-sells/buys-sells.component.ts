import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { BuysSellsService } from '../../../core/services/buys-sells.service';
import { BuySell } from '../../../core/dtos/buy-sell.dto';
import {
  PaginatorConfig,
  TableComponent,
  TableHeader,
  TableRow,
} from '../../../shared/components/table/table.component';
import { formatCurrency } from '../../../shared/utils/currency';
import { PaginationParams } from '../../../core/dtos/pagination.dto';

interface BuySellTableRowData {
  asset: string;
  date: string;
  fees: string;
  price: string;
  quantity: number;
  taxes: string;
  total: string;
  type: string;
}

@Component({
  selector: 'app-buys-sells',
  imports: [TableComponent],
  templateUrl: './buys-sells.component.html',
  styleUrl: './buys-sells.component.scss',
})
export class BuysSellsComponent implements OnInit {
  public readonly buysSellsService = inject(BuysSellsService);
  public readonly buysSells = signal<BuySell[]>([]);
  public readonly tableData: Signal<BuySellTableRowData[]> = computed(() =>
    this.buysSells().map((buySell) => {
      const { asset } = buySell;

      return {
        date: buySell.date,
        asset: asset.ticker,
        type: buySell.type,
        quantity: buySell.quantity,
        price: formatCurrency(asset.currency, buySell.price),
        fees: formatCurrency(asset.currency, buySell.fees),
        taxes: formatCurrency(asset.currency, buySell.taxes),
        total: formatCurrency(asset.currency, buySell.total),
      };
    }),
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'date', value: 'Date' },
    { key: 'asset', value: 'Asset' },
    { key: 'type', value: 'Type' },
    { key: 'quantity', value: 'Quantity' },
    { key: 'price', value: 'Price' },
    { key: 'fees', value: 'Fees' },
    { key: 'taxes', value: 'Taxes' },
    { key: 'total', value: 'Total' },
  ];

  public ngOnInit(): void {
    this.getBuysSells();
  }

  public handleRowClick(row: TableRow): void {
    // const buySellRowData = row as BuySellTableRowData;
  }

  public handlePageClick(event: PageEvent): void {
    this.getBuysSells({ limit: event.pageSize, page: event.pageIndex });
  }

  private getBuysSells(paginationParams?: PaginationParams): void {
    this.buysSellsService.get(1, 1, paginationParams).subscribe({
      next: (getBuysSellsResponse) => {
        const { data, total, page, itemsPerPage } = getBuysSellsResponse;

        this.buysSells.set(data);
        this.paginatorConfig.set({
          length: total,
          pageIndex: page,
          pageSize: itemsPerPage,
        });
      },
    });
  }
}
