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
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';

import { OperationsService } from '../../../../../core/services/operations.service';
import { Operation } from '../../../../../core/dtos/operation';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../../core/dtos/request';
import {
  PaginatorConfig,
  TableAction,
  TableActionNames,
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';
import { formatCurrency } from '../../../../../shared/utils/number';
import { OperationModalComponent } from '../../../operation-modal/operation-modal.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { ImportOperationsModalComponent } from '../../../import-operations-modal/import-operations-modal.component';
import { DeleteOperationModalComponent } from '../../../delete-operation-modal/delete-operation-modal.component';
import { AuthService } from '../../../../../core/services/auth.service';
import { AssetClasses } from '../../../../../core/dtos/asset.dto';
import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';

interface OperationsTableRowData {
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
    OperationModalComponent,
    ImportOperationsModalComponent,
    DeleteOperationModalComponent,
  ],
  templateUrl: './portfolio-asset-operations.component.html',
})
export class PortfolioAssetOperationsComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly operationsService = inject(OperationsService);
  private readonly operations = signal<Operation[]>([]);

  public readonly portfolioAsset = input<PortfolioAsset>();
  public readonly updateOperations = output<void>();
  public operationModalComponent = viewChild(OperationModalComponent);
  public importOperationsModalComponent = viewChild(
    ImportOperationsModalComponent,
  );
  public deleteOperationModalComponent = viewChild(
    DeleteOperationModalComponent,
  );
  public readonly tableData: Signal<OperationsTableRowData[]> = computed(() =>
    this.operations().map((operation) => {
      const { portfolioAsset } = operation;

      return {
        id: operation.id,
        date: operation.date,
        asset: portfolioAsset.asset.ticker,
        type: operation.type,
        quantity: operation.quantity,
        price: formatCurrency(portfolioAsset.asset.currency, operation.price),
        fees:
          portfolioAsset.asset.class === AssetClasses.Cryptocurrency
            ? String(operation.fees)
            : formatCurrency(portfolioAsset.asset.currency, operation.fees),
        taxes: formatCurrency(portfolioAsset.asset.currency, operation.taxes),
        total: formatCurrency(portfolioAsset.asset.currency, operation.total),
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
  public modalRef?: MatDialogRef<ModalComponent>;

  constructor() {
    effect(() => {
      this.getOperations()?.subscribe();
    });
  }

  public handlePageClick(event: PageEvent): void {
    this.getOperations({
      limit: event.pageSize,
      page: event.pageIndex,
    })?.subscribe();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const operationsTableRowData = action.row as OperationsTableRowData;

    if (action.name === TableActionNames.Delete) {
      const deleteOperationModalComponent =
        this.deleteOperationModalComponent();

      this.modalRef = this.dialog.open(ModalComponent, {
        autoFocus: 'dialog',
        data: {
          title: 'Excluir Operação',
          contentTemplate:
            deleteOperationModalComponent?.deleteOperationModalContentTemplate(),
          actionsTemplate:
            deleteOperationModalComponent?.deleteOperationModalActionsTemplate(),
          context: { operationId: operationsTableRowData.id },
        },
        restoreFocus: false,
      });
    }
  }

  public handleAddButtonClick(): void {
    const operationModalComponent = this.operationModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Adicionar Operação',
        contentTemplate:
          operationModalComponent?.operationModalContentTemplate(),
        actionsTemplate:
          operationModalComponent?.operationModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleImportButtonClick(): void {
    const importOperationsModalComponent =
      this.importOperationsModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Importar Operações',
        contentTemplate:
          importOperationsModalComponent?.importOperationsModalContentTemplate(),
        actionsTemplate:
          importOperationsModalComponent?.importOperationsModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public updateOperationsList(): void {
    this.getOperations()?.subscribe({
      next: () => {
        this.closeModal();
        this.updateOperations.emit();
      },
    });
  }

  public handleDeleteOperation(): void {
    this.getOperations()?.subscribe({
      next: () => {
        if (!this.operations().length) {
          this.router.navigate(['..'], { relativeTo: this.activatedRoute });
        } else {
          this.updateOperations.emit();
        }

        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getOperations(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<Operation>> | void {
    if (this.portfolioAsset()) {
      const loggedUser = this.authService.getLoggedUser()!;
      const defaultPortfolio = loggedUser.portfolios.find(
        (portfolio) => portfolio.default,
      )!;
      const params = paginationParams ?? { limit: 10, page: 0 };

      return this.operationsService
        .get(defaultPortfolio.id, {
          portfolioAssetId: this.portfolioAsset()!.id,
          ...params,
        })
        .pipe(
          tap((getOperationsResponse) => {
            const { data, total, page, itemsPerPage } = getOperationsResponse;

            this.operations.set(data);
            this.paginatorConfig.set({
              length: total,
              pageIndex: page!,
              pageSize: itemsPerPage!,
            });
          }),
        );
    }
  }
}
