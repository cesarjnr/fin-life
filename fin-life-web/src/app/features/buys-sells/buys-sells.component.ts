import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';

import { BuysSellsService } from '../../core/services/buys-sells.service';
import { BuySell } from '../../core/dtos/buy-sell.dto';
import { TableComponent, TableHeader, TableRow } from '../../shared/components/table/table.component';
import { formatCurrency } from '../../shared/utils/currency';

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
  styleUrl: './buys-sells.component.scss'
})
export class BuysSellsComponent implements OnInit {
  public readonly buysSellsService = inject(BuysSellsService);
  public readonly buysSells = signal<BuySell[]>([]);
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
  public readonly tableData: Signal<BuySellTableRowData[]> = computed(() => this.buysSells().map((buySell) => {
    const { asset } = buySell;

    return {
      date: buySell.date,
      asset: asset.ticker,
      type: buySell.type,
      quantity: buySell.quantity,
      price: formatCurrency(asset.currency, buySell.price),
      fees: formatCurrency(asset.currency, buySell.fees),
      taxes: formatCurrency(asset.currency, buySell.taxes),
      total: formatCurrency(asset.currency, buySell.total)
    };
  }));

  public ngOnInit(): void {
    this.getBuysSells();
  }

  public handleRowClick(row: TableRow): void {
    const buySellRowData = row as BuySellTableRowData;

    console.log(buySellRowData);
  }

  private getBuysSells(): void {
    this.buysSellsService.get(1, 1).subscribe({
      next: (getBuysSellsResponse) => {
        const { data } = getBuysSellsResponse;

        this.buysSells.set(data);
      }
    })
  }
}
