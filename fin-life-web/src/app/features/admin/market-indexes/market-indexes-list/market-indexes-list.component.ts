import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Observable, tap } from 'rxjs';

import { CommonService } from '../../../../core/services/common.service';
import { ToggleStateModalComponent } from '../../../../shared/components/toggle-state-modal/toggle-state-modal.component';
import { MarketIndexesService } from '../../../../core/services/market-indexes.service';
import {
  MarketIndex,
  MarketIndexTypes,
} from '../../../../core/dtos/market-index.dto';
import {
  PaginatorConfig,
  TableHeader,
  TableComponent,
  TableActiveColumnChange,
  TableRow,
} from '../../../../shared/components/table/table.component';
import {
  formatCurrency,
  formatPercentage,
} from '../../../../shared/utils/number';
import { Currencies } from '../../../../core/dtos/common.dto';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../core/dtos/request';

interface MarketIndexesTableRowData {
  id: number;
  code: string;
  interval: string;
  type: string;
  value: string;
  active: boolean;
}

@Component({
  selector: 'app-indexes-list',
  imports: [TableComponent, MatButtonModule, MatIconModule],
  templateUrl: './market-indexes-list.component.html',
})
export class MarketIndexesListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);

  public toggleStateModalComponent = viewChild(ToggleStateModalComponent);
  public readonly marketIndexesService = inject(MarketIndexesService);
  // public readonly marketIndexModalComponent = viewChild();
  public readonly marketIndexes = signal<MarketIndex[]>([]);
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'code', value: 'Código' },
    { key: 'interval', value: 'Intervalo' },
    { key: 'type', value: 'Tipo' },
    { key: 'value', value: 'Valor' },
    { key: 'active', value: '' },
  ];
  public readonly tableData: Signal<MarketIndexesTableRowData[]> = computed(
    () =>
      this.marketIndexes().map((marketIndex) => {
        const marketIndexValue =
          marketIndex.marketIndexHistoricalData[0]?.value;

        return {
          id: marketIndex.id,
          code: marketIndex.code,
          interval: marketIndex.interval,
          type: marketIndex.type,
          value: marketIndexValue
            ? marketIndex.type === MarketIndexTypes.Currency
              ? formatCurrency(Currencies.BRL, marketIndexValue)
              : formatPercentage(marketIndexValue)
            : '-',
          active: marketIndex.active,
        };
      }),
  );
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.getMarketIndexes().subscribe();
  }

  public handleRowClick(row: TableRow): void {
    const marketIndexRowData = row as MarketIndexesTableRowData;

    this.router.navigate([marketIndexRowData.id], {
      relativeTo: this.activatedRoute,
    });
  }

  public handlePageClick(event: PageEvent): void {
    this.getMarketIndexes({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleActiveColumnChange(event: TableActiveColumnChange): void {
    const marketIndexesListTableRowData =
      event.row as MarketIndexesTableRowData;
    const toggleStateModalComponent = this.toggleStateModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      autoFocus: 'dialog',
      data: {
        title: `${event.active ? 'Ativar' : 'Desativar'} Índice de Mercado`,
        contentTemplate:
          toggleStateModalComponent?.toggleStateModalContentTemplate(),
        actionsTemplate:
          toggleStateModalComponent?.toggleStateModalActionsTemplate(),
        context: { id: marketIndexesListTableRowData.id, state: event.active },
      },
      restoreFocus: false,
    });
  }

  public handleSyncValuesButtonClick(): void {}

  public handleAddButtonClick(): void {}

  private getMarketIndexes(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<MarketIndex>> {
    this.commonService.setLoading(true);

    const params = paginationParams ?? { limit: 10, page: 0 };

    return this.marketIndexesService.get(params).pipe(
      tap((getMarketIndexesResponse) => {
        const { data, itemsPerPage, page, total } = getMarketIndexesResponse;

        this.marketIndexes.set(data);
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
