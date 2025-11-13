import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AssetsService } from '../../../../core/services/assets.service';
import { Asset } from '../../../../core/dtos/asset.dto';
import {
  TableHeader,
  TableComponent,
  TableRow,
  PaginatorConfig,
  TableActiveColumnChange,
} from '../../../../shared/components/table/table.component';
import { formatCurrency } from '../../../../shared/utils/number';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { CommonService } from '../../../../core/services/common.service';
import { PageEvent } from '@angular/material/paginator';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../core/dtos/request';
import {
  ToggleStateModalComponent,
  ToggleStateChange,
} from '../../../../shared/components/toggle-state-modal/toggle-state-modal.component';
import { Observable, tap } from 'rxjs';

interface ProductsTableRowData {
  id: number;
  ticker: string;
  category: string;
  class: string;
  lastPrice: string;
  sector: string;
  active: boolean;
}

@Component({
  selector: 'app-products-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    ProductModalComponent,
    ToggleStateModalComponent,
  ],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);

  public toggleStateModalComponent = viewChild(ToggleStateModalComponent);
  public readonly assetsService = inject(AssetsService);
  public readonly productModalComponent = viewChild(ProductModalComponent);
  public readonly assets = signal<Asset[]>([]);
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'ticker', value: 'Código' },
    { key: 'category', value: 'Categoria' },
    { key: 'class', value: 'Classe' },
    { key: 'sector', value: 'Setor' },
    { key: 'lastPrice', value: 'Preço' },
    { key: 'active', value: '' },
  ];
  public readonly tableData: Signal<ProductsTableRowData[]> = computed(() =>
    this.assets().map((asset) => ({
      id: asset.id,
      ticker: asset.ticker,
      category: asset.category,
      class: asset.class,
      lastPrice: asset.assetHistoricalPrices[0]?.closingPrice
        ? formatCurrency(
            asset.currency,
            asset.assetHistoricalPrices[0].closingPrice,
          )
        : '-',
      sector: asset.sector || '-',
      active: asset.active,
    })),
  );
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.getAssets().subscribe();
  }

  public handleSyncPricesButtonClick(): void {
    this.commonService.setLoading(true);
    this.assetsService.syncPrices().subscribe({
      next: () => {
        this.commonService.setLoading(false);
        this.getAssets().subscribe();
        this.toastrService.success(
          'Preços dos ativos sincronizados com sucesso',
        );
      },
    });
  }

  public handleRowClick(row: TableRow): void {
    const productRowData = row as ProductsTableRowData;

    this.router.navigate([productRowData.id], {
      relativeTo: this.activatedRoute,
    });
  }

  public handlePageClick(event: PageEvent): void {
    this.getAssets({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleActiveColumnChange(event: TableActiveColumnChange): void {
    const productsListTableRowData = event.row as ProductsTableRowData;
    const toggleStateModalComponent = this.toggleStateModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      autoFocus: 'dialog',
      data: {
        title: `${event.active ? 'Ativar' : 'Desativar'} Produto`,
        contentTemplate:
          toggleStateModalComponent?.toggleStateModalContentTemplate(),
        actionsTemplate:
          toggleStateModalComponent?.toggleStateModalActionsTemplate(),
        context: { id: productsListTableRowData.id, state: event.active },
      },
      restoreFocus: false,
    });
  }

  public handleAddButtonClick(): void {
    const productModalComponent = this.productModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Adicionar Produto',
        contentTemplate: productModalComponent?.productModalContentTemplate(),
        actionsTemplate: productModalComponent?.productModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleSaveProduct(asset: Asset): void {
    const updatedAssetsList = [...this.assets(), asset];

    updatedAssetsList
      .sort((a, b) => a.class.localeCompare(b.class))
      .sort((a, b) => a.ticker.localeCompare(b.ticker));
    this.assets.set(updatedAssetsList);
    this.closeModal();
  }

  public handleToggleStateModalCancel(event: ToggleStateChange): void {
    const assets = [...this.assets()];
    const assetIndex = assets.findIndex((asset) => asset.id === event.id);

    assets[assetIndex].active = !event.state;

    this.assets.set(assets);
    this.closeModal();
  }

  public handleToggleStateModalConfirm(event: ToggleStateChange): void {
    this.commonService.setLoading(true);
    this.assetsService.update(event.id, { active: event.state }).subscribe({
      next: () => {
        this.commonService.setLoading(false);
        this.toastrService.success(
          `Produto ${event.state ? 'ativado' : 'desativado'} com sucesso`,
        );
        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getAssets(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<Asset>> {
    this.commonService.setLoading(true);

    const params = paginationParams ?? { limit: 10, page: 0 };

    return this.assetsService.get(params).pipe(
      tap((getAssetsResponse) => {
        const { data, itemsPerPage, page, total } = getAssetsResponse;

        this.assets.set(data);
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
