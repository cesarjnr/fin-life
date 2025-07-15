import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';

import { BuysSellsService } from '../../../../../core/services/buys-sells.service';
import { BuySell } from '../../../../../core/dtos/buy-sell.dto';
import {
  PaginationParams,
  PaginationResponse,
} from '../../../../../core/dtos/pagination.dto';
import {
  PaginatorConfig,
  TableAction,
  TableActionNames,
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';
import { formatCurrency } from '../../../../../shared/utils/number';
import { BuySellModalComponent } from '../../../buy-sell-modal/buy-sell-modal.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { ImportBuysSellsModalComponent } from '../../../import-buys-sells-modal/import-buys-sells-modal.component';
import { DeleteBuySellModalComponent } from '../../../delete-buy-sell-modal/delete-buy-sell-modal.component';
import { AuthService } from '../../../../../core/services/auth.service';

interface BuySellTableRowData {
  id: number;
  date: string;
  fees: string;
  price: string;
  quantity: number;
  taxes: string;
  total: string;
  type: string;
  actions: {
    delete: boolean;
  };
}

@Component({
  selector: 'app-portfolio-asset-operations',
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    BuySellModalComponent,
    DeleteBuySellModalComponent,
    ImportBuysSellsModalComponent,
  ],
  templateUrl: './portfolio-asset-operations.component.html',
})
export class PortfolioAssetOperationsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly buysSellsService = inject(BuysSellsService);
  private readonly buysSells = signal<BuySell[]>([]);

  public buySellModalComponent = viewChild(BuySellModalComponent);
  public importBuysSellsModalComponent = viewChild(
    ImportBuysSellsModalComponent,
  );
  public deleteBuySellModalComponent = viewChild(DeleteBuySellModalComponent);
  public readonly tableData: Signal<BuySellTableRowData[]> = computed(() =>
    this.buysSells().map((buySell) => {
      const { asset } = buySell;

      return {
        id: buySell.id,
        date: buySell.date,
        asset: asset.ticker,
        type: buySell.type,
        quantity: buySell.quantity,
        price: formatCurrency(asset.currency, buySell.price),
        fees: formatCurrency(asset.currency, buySell.fees),
        taxes: formatCurrency(asset.currency, buySell.taxes),
        total: formatCurrency(asset.currency, buySell.total),
        actions: {
          delete: true,
        },
      };
    }),
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );

  public readonly tableHeaders: TableHeader[] = [
    { key: 'date', value: 'Data' },
    { key: 'type', value: 'Tipo' },
    { key: 'quantity', value: 'Quantidade' },
    { key: 'price', value: 'Preço' },
    { key: 'fees', value: 'Taxas' },
    { key: 'taxes', value: 'Impostos' },
    { key: 'total', value: 'Total' },
    { key: 'actions', value: '' },
  ];
  public assetId?: number;
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.assetId = Number(this.activatedRoute.snapshot.paramMap.get('assetId'));

    this.getBuysSells().subscribe();
  }

  public handlePageClick(event: PageEvent): void {
    this.getBuysSells({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const buySellTableRowData = action.row as BuySellTableRowData;

    if (action.name === TableActionNames.Delete) {
      const deleteBuySellModalComponent = this.deleteBuySellModalComponent();

      this.modalRef = this.dialog.open(ModalComponent, {
        autoFocus: 'dialog',
        data: {
          title: 'Excluir Operação',
          contentTemplate:
            deleteBuySellModalComponent?.deleteBuySellModalContentTemplate(),
          actionsTemplate:
            deleteBuySellModalComponent?.deleteBuySellModalActionsTemplate(),
          context: { buySellId: buySellTableRowData.id },
        },
        restoreFocus: false,
      });
    }
  }

  public handleAddButtonClick(): void {
    const buySellModalComponent = this.buySellModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Adicionar Operação',
        contentTemplate: buySellModalComponent?.buySellModalContentTemplate(),
        actionsTemplate: buySellModalComponent?.buySellModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleImportButtonClick(): void {
    const importBuysSellsModalComponent = this.importBuysSellsModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Importar Operações',
        contentTemplate:
          importBuysSellsModalComponent?.importBuysSellsModalContentTemplate(),
        actionsTemplate:
          importBuysSellsModalComponent?.importBuysSellsModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public updateBuysSellsList(): void {
    this.getBuysSells().subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public handleDeleteBuySell(): void {
    this.getBuysSells().subscribe({
      next: () => {
        if (!this.buysSells().length) {
          this.router.navigate(['..'], { relativeTo: this.activatedRoute });
        }

        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getBuysSells(
    paginationParams?: PaginationParams,
  ): Observable<PaginationResponse<BuySell>> {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const params = paginationParams ?? { limit: 10, page: 0 };

    return this.buysSellsService
      .get(loggedUser.id, defaultPortfolio.id, {
        assetId: this.assetId,
        ...params,
      })
      .pipe(
        tap((getBuysSellsResponse) => {
          const { data, total, page, itemsPerPage } = getBuysSellsResponse;

          this.buysSells.set(data);
          this.paginatorConfig.set({
            length: total,
            pageIndex: page!,
            pageSize: itemsPerPage!,
          });
        }),
      );
  }
}
