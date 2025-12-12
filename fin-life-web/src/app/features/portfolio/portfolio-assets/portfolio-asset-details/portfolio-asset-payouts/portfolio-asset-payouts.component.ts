import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';

import {
  PaginatorConfig,
  TableAction,
  TableActionNames,
  TableComponent,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/table/table.component';
import { PortfolioAssetPayoutModalComponent } from './portfolio-asset-payout-modal/portfolio-asset-payout-modal.component';
import { PayoutsService } from '../../../../../core/services/payouts.service';
import { Payout } from '../../../../../core/dtos/payout.dto';
import { formatCurrency } from '../../../../../shared/utils/number';
import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../../core/dtos/request';
import { AuthService } from '../../../../../core/services/auth.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { DeletePortfolioAssetPayoutModalComponent } from './delete-portfolio-asset-payout-modal/delete-portfolio-asset-payout-modal.component';
import { ImportPortfolioAssetPayoutsModalComponent } from './import-portfolio-asset-payouts-modal/import-portfolio-asset-payouts-modal.component';

interface PayoutRowData {
  id: number;
  date: string;
  type: string;
  quantity: number;
  value: string;
  taxes: string;
  total: string;
}

@Component({
  selector: 'app-portfolio-asset-payouts',
  imports: [
    MatIconModule,
    MatButtonModule,
    TableComponent,
    PortfolioAssetPayoutModalComponent,
    DeletePortfolioAssetPayoutModalComponent,
    ImportPortfolioAssetPayoutsModalComponent,
  ],
  templateUrl: './portfolio-asset-payouts.component.html',
})
export class PortfolioAssetPayoutsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly payoutsService = inject(PayoutsService);
  private readonly payouts = signal<Payout[]>([]);

  public readonly portfolioAsset = input<PortfolioAsset>();
  public readonly updatePayouts = output<void>();
  public readonly portfolioAssetPayoutdModalComponent = viewChild(
    PortfolioAssetPayoutModalComponent,
  );
  public readonly importPortfolioAssetPayoutsModalComponent = viewChild(
    ImportPortfolioAssetPayoutsModalComponent,
  );
  public readonly deletePortfolioAssetPayoutModalComponent = viewChild(
    DeletePortfolioAssetPayoutModalComponent,
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly payout = signal<Payout | undefined>(undefined);
  public readonly tableData: Signal<PayoutRowData[]> = computed(() =>
    this.payouts().map((payout) => ({
      id: payout.id,
      date: payout.date,
      type: payout.type,
      quantity: payout.quantity,
      value: formatCurrency(
        this.portfolioAsset()!.asset.currency,
        payout.value,
      ),
      taxes: formatCurrency(
        this.portfolioAsset()!.asset.currency,
        payout.taxes,
      ),
      total: formatCurrency(
        this.portfolioAsset()!.asset.currency,
        payout.total,
      ),
      actions: {
        delete: true,
      },
    })),
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'date', value: 'Data' },
    { key: 'type', value: 'Tipo' },
    { key: 'quantity', value: 'Quantidade' },
    { key: 'value', value: 'Valor' },
    { key: 'taxes', value: 'Impostos' },
    { key: 'total', value: 'Total' },
    { key: 'actions', value: '' },
  ];
  public modalRef?: MatDialogRef<ModalComponent>;

  constructor() {
    effect(() => {
      if (this.portfolioAsset() && !this.paginatorConfig()) {
        this.getPayouts().subscribe();
      }
    });
  }

  public handleRowClick(row: TableRow): void {
    const payoutRowData = row as PayoutRowData;

    this.payout.set(
      this.payouts().find((payout) => payout.id === payoutRowData.id)!,
    );
    this.handleAddButtonClick();
  }

  public handlePageClick(event: PageEvent): void {
    this.getPayouts({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const payoutRowData = action.row as PayoutRowData;

    if (action.name === TableActionNames.Delete) {
      const deletePortfolioAssetPayoutModalComponent =
        this.deletePortfolioAssetPayoutModalComponent();

      this.modalRef = this.dialog.open(ModalComponent, {
        autoFocus: 'dialog',
        data: {
          title: 'Excluir Provento',
          contentTemplate:
            deletePortfolioAssetPayoutModalComponent?.deletePayoutModalContentTemplate(),
          actionsTemplate:
            deletePortfolioAssetPayoutModalComponent?.deletePayoutModalActionsTemplate(),
          context: {
            payoutId: payoutRowData.id,
          },
        },
        restoreFocus: false,
      });
    }
  }

  public handleAddButtonClick(): void {
    const portfolioAssetPayoutdModalComponent =
      this.portfolioAssetPayoutdModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Adicionar Provento',
        contentTemplate:
          portfolioAssetPayoutdModalComponent?.payoutModalContentTemplate(),
        actionsTemplate:
          portfolioAssetPayoutdModalComponent?.payoutModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleImportButtonClick(): void {
    const importPortfolioAssetPayoutsModalComponent =
      this.importPortfolioAssetPayoutsModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Importar Dividendos',
        contentTemplate:
          importPortfolioAssetPayoutsModalComponent?.importPayoutsModalContentTemplate(),
        actionsTemplate:
          importPortfolioAssetPayoutsModalComponent?.importPayoutsModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public updatePayoutsList(): void {
    this.getPayouts().subscribe({
      next: () => {
        this.closeModal();
        this.payout.set(undefined);
        this.updatePayouts.emit();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getPayouts(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<Payout>> {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const params = {
      ...(paginationParams ?? { limit: 10, page: 0 }),
      portfolioAssetId: this.portfolioAsset()!.id,
    };

    return this.payoutsService.get(defaultPortfolio.id, params).pipe(
      tap((getPayoutssResponse) => {
        const { data, total, page, itemsPerPage } = getPayoutssResponse;

        this.payouts.set(data);
        this.paginatorConfig.set({
          length: total,
          pageIndex: page!,
          pageSize: itemsPerPage!,
        });
      }),
    );
  }
}
