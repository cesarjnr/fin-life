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
import { Sort } from '@angular/material/sort';
import { Observable, tap } from 'rxjs';

import { OperationsService } from '../../../core/services/operations.service';
import { Operation } from '../../../core/dtos/operation';
import { Asset, AssetClasses } from '../../../core/dtos/asset.dto';
import {
  PaginatorConfig,
  TableAction,
  TableComponent,
  TableHeader,
} from '../../../shared/components/table/table.component';
import { formatCurrency } from '../../../shared/utils/number';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../core/dtos/request';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { OperationModalComponent } from '../operation-modal/operation-modal.component';
import { ImportOperationsModalComponent } from '../import-operations-modal/import-operations-modal.component';
import { DeleteOperationModalComponent } from '../delete-operation-modal/delete-operation-modal.component';
import { CommonService } from '../../../core/services/common.service';

interface OperationsTableRowData {
  id: number;
  asset: string;
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
  selector: 'app-operations',
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    OperationModalComponent,
    DeleteOperationModalComponent,
    ImportOperationsModalComponent,
  ],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss',
})
export class OperationsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly commonService = inject(CommonService);
  private readonly operationsService = inject(OperationsService);
  private readonly operations = signal<Operation[]>([]);

  public operationModalComponent = viewChild(OperationModalComponent);
  public importOperationsModalComponent = viewChild(
    ImportOperationsModalComponent,
  );
  public deleteOperationModalComponent = viewChild(
    DeleteOperationModalComponent,
  );
  public readonly assets = signal<Asset[]>([]);
  public readonly tableData: Signal<OperationsTableRowData[]> = computed(() =>
    this.operations().map((operation) => {
      const { portfolioAsset } = operation;

      return {
        id: operation.id,
        date: operation.date,
        asset: portfolioAsset.asset.code,
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
    { key: 'date', value: 'Data', sortInitialDirection: 'desc' },
    { key: 'asset', value: 'Ativo' },
    { key: 'type', value: 'Tipo' },
    { key: 'quantity', value: 'Quantidade' },
    { key: 'price', value: 'Preço' },
    { key: 'fees', value: 'Taxas' },
    { key: 'taxes', value: 'Impostos' },
    { key: 'total', value: 'Total' },
    { key: 'actions', value: '' },
  ];
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.getOperations().subscribe();
  }

  public handleSortClick(event: Sort): void {
    this.getOperations({
      orderBy: event.direction,
      orderByColumn: event.active,
      page: 0,
    }).subscribe();
  }

  public handlePageClick(event: PageEvent): void {
    this.getOperations({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const operationsTableRowData = action.row as OperationsTableRowData;

    if (action.name === 'delete') {
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
    this.getOperations().subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getOperations(
    getRequestParams?: GetRequestParams,
  ): Observable<GetRequestResponse<Operation>> {
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId')!,
    );
    const params = Object.assign(
      {
        limit: this.paginatorConfig()?.pageSize ?? 10,
        page: this.paginatorConfig()?.pageIndex ?? 0,
      },
      getRequestParams,
    );

    this.commonService.setLoading(true);

    return this.operationsService.get(portfolioId, params).pipe(
      tap((getBuysSellsResponse) => {
        const { data, total, page, itemsPerPage } = getBuysSellsResponse;

        this.operations.set(data);
        this.paginatorConfig.set({
          length: total,
          pageIndex: page!,
          pageSize: itemsPerPage!,
        });
        this.commonService.setLoading(false);
      }),
    );
  }
}
