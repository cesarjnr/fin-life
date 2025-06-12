import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { BuysSellsService } from '../../../core/services/buys-sells.service';
import { AssetsService } from '../../../core/services/assets.service';
import { BuySell } from '../../../core/dtos/buy-sell.dto';
import { Asset } from '../../../core/dtos/asset.dto';
import {
  PaginatorConfig,
  TableComponent,
  TableHeader,
  TableRow,
} from '../../../shared/components/table/table.component';
import { formatCurrency } from '../../../shared/utils/number';
import { PaginationParams } from '../../../core/dtos/pagination.dto';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BuySellModalComponent } from './buy-sell-modal/buy-sell-modal.component';

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
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    BuySellModalComponent,
  ],
  templateUrl: './buys-sells.component.html',
  styleUrl: './buys-sells.component.scss',
})
export class BuysSellsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly buysSellsService = inject(BuysSellsService);
  private readonly assetsService = inject(AssetsService);
  private readonly buysSells = signal<BuySell[]>([]);

  public buySellModalComponent = viewChild(BuySellModalComponent);
  public readonly assets = signal<Asset[]>([]);
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
    { key: 'date', value: 'Data' },
    { key: 'asset', value: 'Ativo' },
    { key: 'type', value: 'Tipo' },
    { key: 'quantity', value: 'Quantidade' },
    { key: 'price', value: 'Preço' },
    { key: 'fees', value: 'Taxas' },
    { key: 'taxes', value: 'Impostos' },
    { key: 'total', value: 'Total' },
  ];
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.getBuysSells();
    this.getAssets();
  }

  public handleRowClick(row: TableRow): void {
    // const buySellRowData = row as BuySellTableRowData;
  }

  public handlePageClick(event: PageEvent): void {
    this.getBuysSells({ limit: event.pageSize, page: event.pageIndex });
  }

  public handleAddButtonClick(): void {
    const buySellModalComponent = this.buySellModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Add Operation',
        contentTemplate: buySellModalComponent?.buySellModalContentTemplate(),
        actionsTemplate: buySellModalComponent?.buySellModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleSaveBuySell(): void {
    this.getBuysSells();
    this.closeModal();
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getBuysSells(paginationParams?: PaginationParams): void {
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId')!,
    );

    this.buysSellsService.get(1, portfolioId, paginationParams).subscribe({
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

  private getAssets(): void {
    this.assetsService.get().subscribe({
      next: (assets) => {
        this.assets.set(assets);
      },
    });
  }
}
