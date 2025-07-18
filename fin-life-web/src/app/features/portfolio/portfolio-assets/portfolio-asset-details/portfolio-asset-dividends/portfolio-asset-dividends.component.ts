import {
  Component,
  computed,
  effect,
  inject,
  input,
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
import { PortfolioAssetDividendModalComponent } from './portfolio-asset-dividend-modal/portfolio-asset-dividend-modal.component';
import { PortfoliosAssetsDividendsService } from '../../../../../core/services/portfolios-assets-dividends.service';
import { PortfolioAssetDividend } from '../../../../../core/dtos/portfolio-asset-dividend.dto';
import { formatCurrency } from '../../../../../shared/utils/number';
import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  PaginationParams,
  PaginationResponse,
} from '../../../../../core/dtos/pagination.dto';
import { AuthService } from '../../../../../core/services/auth.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { DeletePortfolioAssetDividendModalComponent } from './delete-portfolio-asset-dividend-modal/delete-portfolio-asset-dividend-modal.component';
import { ImportPortfolioAssetDividendsModalComponent } from './import-portfolio-asset-dividends-modal/import-portfolio-asset-dividends-modal.component';

interface PortfolioAssetDividendRowData {
  id: number;
  date: string;
  type: string;
  quantity: number;
  value: string;
  taxes: string;
  total: string;
}

@Component({
  selector: 'app-portfolio-asset-dividends',
  imports: [
    MatIconModule,
    MatButtonModule,
    TableComponent,
    PortfolioAssetDividendModalComponent,
    DeletePortfolioAssetDividendModalComponent,
    ImportPortfolioAssetDividendsModalComponent,
  ],
  templateUrl: './portfolio-asset-dividends.component.html',
})
export class PortfolioAssetDividendsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly portfolioAssetsDividends = signal<PortfolioAssetDividend[]>(
    [],
  );

  public portfolioAsset = input<PortfolioAsset>();
  public portfolioAssetDividendModalComponent = viewChild(
    PortfolioAssetDividendModalComponent,
  );
  public importPortfolioAssetDividendsModalComponent = viewChild(
    ImportPortfolioAssetDividendsModalComponent,
  );
  public deletePortfolioAssetDividendModalComponent = viewChild(
    DeletePortfolioAssetDividendModalComponent,
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly portfolioAssetDividend = signal<
    PortfolioAssetDividend | undefined
  >(undefined);
  public readonly tableData: Signal<PortfolioAssetDividendRowData[]> = computed(
    () =>
      this.portfolioAssetsDividends().map((portfolioAssetDividend) => ({
        id: portfolioAssetDividend.id,
        date: portfolioAssetDividend.date,
        type: portfolioAssetDividend.type,
        quantity: portfolioAssetDividend.quantity,
        value: formatCurrency(
          this.portfolioAsset()!.asset.currency,
          portfolioAssetDividend.value,
        ),
        taxes: formatCurrency(
          this.portfolioAsset()!.asset.currency,
          portfolioAssetDividend.taxes,
        ),
        total: formatCurrency(
          this.portfolioAsset()!.asset.currency,
          portfolioAssetDividend.total,
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
        this.getPortfolioAssetDividends().subscribe();
      }
    });
  }

  public handleRowClick(row: TableRow): void {
    const portfolioAssetDividendRowData = row as PortfolioAssetDividendRowData;

    this.portfolioAssetDividend.set(
      this.portfolioAssetsDividends().find(
        (portfolioAssetDividend) =>
          portfolioAssetDividend.id === portfolioAssetDividendRowData.id,
      )!,
    );
    this.handleAddButtonClick();
  }

  public handlePageClick(event: PageEvent): void {
    this.getPortfolioAssetDividends({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const portfolioAssetDividendRowData =
      action.row as PortfolioAssetDividendRowData;

    if (action.name === TableActionNames.Delete) {
      const deletePortfolioAssetDividendModalComponent =
        this.deletePortfolioAssetDividendModalComponent();

      this.modalRef = this.dialog.open(ModalComponent, {
        autoFocus: 'dialog',
        data: {
          title: 'Excluir Provento',
          contentTemplate:
            deletePortfolioAssetDividendModalComponent?.deletePortfolioAssetDividendModalContentTemplate(),
          actionsTemplate:
            deletePortfolioAssetDividendModalComponent?.deletePortfolioAssetDividendModalActionsTemplate(),
          context: {
            portfolioAssetDividendId: portfolioAssetDividendRowData.id,
          },
        },
        restoreFocus: false,
      });
    }
  }

  public handleAddButtonClick(): void {
    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Adicionar Provento',
        contentTemplate:
          this.portfolioAssetDividendModalComponent()!.portfolioAssetDividendModalContentTemplate(),
        actionsTemplate:
          this.portfolioAssetDividendModalComponent()!.portfolioAssetDividendModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleImportButtonClick(): void {
    const importPortfolioAssetDividendsModalComponent =
      this.importPortfolioAssetDividendsModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Importar Dividendos',
        contentTemplate:
          importPortfolioAssetDividendsModalComponent!.importPortfolioAssetDividendsModalContentTemplate(),
        actionsTemplate:
          importPortfolioAssetDividendsModalComponent!.importPortfolioAssetDividendsModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public updatePortfolioAssetDividendsList(): void {
    this.getPortfolioAssetDividends().subscribe({
      next: () => {
        this.closeModal();
        this.portfolioAssetDividend.set(undefined);
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getPortfolioAssetDividends(
    paginationParams?: PaginationParams,
  ): Observable<PaginationResponse<PortfolioAssetDividend>> {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const params = {
      ...(paginationParams ?? { limit: 10, page: 0 }),
      portfolioAssetId: this.portfolioAsset()!.id,
    };

    return this.portfoliosAssetsDividendsService
      .get(defaultPortfolio.id, params)
      .pipe(
        tap((getPortfolioAssetDividendsResponse) => {
          const { data, total, page, itemsPerPage } =
            getPortfolioAssetDividendsResponse;

          this.portfolioAssetsDividends.set(data);
          this.paginatorConfig.set({
            length: total,
            pageIndex: page!,
            pageSize: itemsPerPage!,
          });
        }),
      );
  }
}
