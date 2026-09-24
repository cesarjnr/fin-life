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
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';
import { PortfolioAssetEventModalComponent } from './portfolio-asset-event-modal/portfolio-asset-event-modal.component';
import { PortfoliosAssetsEventsService } from '../../../../../core/services/portfolios-assets-events.service';
import { PortfolioAssetEvent } from '../../../../../core/dtos/portfolio-asset-event.dto';
import { formatCurrency } from '../../../../../shared/utils/number';
import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../../core/dtos/request';
import { AuthService } from '../../../../../core/services/auth.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
// import { DeletePortfolioAssetPayoutModalComponent } from './delete-portfolio-asset-payout-modal/delete-portfolio-asset-payout-modal.component';
import { ImportPortfolioAssetEventsModalComponent } from './import-portfolio-asset-events-modal/import-portfolio-asset-events-modal.component';
import { Currencies } from '../../../../../core/dtos/common.dto';
import { formatDate } from '../../../../../shared/utils/date';

interface EventRowData {
  id: number;
  date: string;
  type: string;
  quantity: number;
  value: string;
  taxes: string;
  total: string;
  withdrawal: string;
}

@Component({
  selector: 'app-portfolio-asset-events',
  imports: [
    MatIconModule,
    MatButtonModule,
    TableComponent,
    PortfolioAssetEventModalComponent,
    ImportPortfolioAssetEventsModalComponent,
    // DeletePortfolioAssetPayoutModalComponent,
  ],
  templateUrl: './portfolio-asset-events.component.html',
})
export class PortfolioAssetEventsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsEventsService = inject(
    PortfoliosAssetsEventsService,
  );
  private readonly events = signal<PortfolioAssetEvent[]>([]);

  public readonly portfolioAsset = input<PortfolioAsset>();
  public readonly updateEvents = output<void>();
  public readonly portfolioAssetEventModalComponent = viewChild(
    PortfolioAssetEventModalComponent,
  );
  public readonly importPortfolioAssetEventsModalComponent = viewChild(
    ImportPortfolioAssetEventsModalComponent,
  );
  // public readonly deletePortfolioAssetPayoutModalComponent = viewChild(
  //   DeletePortfolioAssetPayoutModalComponent,
  // );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly event = signal<PortfolioAssetEvent | undefined>(undefined);
  public readonly tableData: Signal<EventRowData[]> = computed(() =>
    this.events().map((event) => ({
      id: event.id,
      date: formatDate(event.date, 'dd/MM/yyyy'),
      type: event.type,
      quantity: event.quantity,
      value: formatCurrency(event.currency, event.value),
      taxes: formatCurrency(event.currency, event.taxes),
      total: formatCurrency(event.currency, event.total),
      withdrawal:
        event.withdrawalDate && event.withdrawalDateExchangeRate
          ? `${formatCurrency(Currencies.BRL, event.withdrawalDateExchangeRate)} - ${formatDate(event.withdrawalDate, 'dd/MM/yyyy')}`
          : '-',
      actions: {
        delete: true,
        edit: true,
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
    { key: 'withdrawal', value: 'Saque' },
    { key: 'actions', value: '' },
  ];
  public modalRef?: MatDialogRef<ModalComponent>;

  constructor() {
    effect(() => {
      if (this.portfolioAsset() && !this.paginatorConfig()) {
        this.getEvents().subscribe();
      }
    });
  }

  public handlePageClick(event: PageEvent): void {
    this.getEvents({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  // public handleTableActionButtonClick(action: TableAction): void {
  //   const eventRowData = action.row as EventRowData;

  //   if (action.name === TableActionNames.Edit) {
  //     this.event.set(
  //       this.events().find((event) => event.id === eventRowData.id)!,
  //     );
  //     this.openPayoutModal();
  //   } else {
  //     const deletePortfolioAssetPayoutModalComponent =
  //       this.deletePortfolioAssetPayoutModalComponent();

  //     this.modalRef = this.dialog.open(ModalComponent, {
  //       autoFocus: 'dialog',
  //       data: {
  //         title: 'Excluir Provento',
  //         contentTemplate:
  //           deletePortfolioAssetPayoutModalComponent?.deletePayoutModalContentTemplate(),
  //         actionsTemplate:
  //           deletePortfolioAssetPayoutModalComponent?.deletePayoutModalActionsTemplate(),
  //         context: {
  //           payoutId: payoutRowData.id,
  //         },
  //       },
  //       restoreFocus: false,
  //     });
  //   }
  // }

  public openEventModal(): void {
    const portfolioAssetEventModalComponent =
      this.portfolioAssetEventModalComponent();
    const event = this.event();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: event ? 'Editar Evento' : 'Adicionar Evento',
        contentTemplate:
          portfolioAssetEventModalComponent?.eventModalContentTemplate(),
        actionsTemplate:
          portfolioAssetEventModalComponent?.eventModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleImportButtonClick(): void {
    const importPortfolioAssetEventsModalComponent =
      this.importPortfolioAssetEventsModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Importar Eventos',
        contentTemplate:
          importPortfolioAssetEventsModalComponent?.importEventsModalContentTemplate(),
        actionsTemplate:
          importPortfolioAssetEventsModalComponent?.importEventsModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleCancelModal(): void {
    this.closeModal();
    this.event.set(undefined);
  }

  public updateEventsList(): void {
    this.getEvents().subscribe({
      next: () => {
        this.closeModal();
        this.event.set(undefined);
        this.updateEvents.emit();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getEvents(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<PortfolioAssetEvent>> {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const params = {
      ...(paginationParams ?? { limit: 10, page: 0 }),
      portfolioAssetId: this.portfolioAsset()!.id,
    };

    return this.portfoliosAssetsEventsService
      .get(defaultPortfolio.id, params)
      .pipe(
        tap((getEventsResponse) => {
          const { data, total, page, itemsPerPage } = getEventsResponse;

          this.events.set(data);
          this.paginatorConfig.set({
            length: total,
            pageIndex: page!,
            pageSize: itemsPerPage!,
          });
        }),
      );
  }
}
