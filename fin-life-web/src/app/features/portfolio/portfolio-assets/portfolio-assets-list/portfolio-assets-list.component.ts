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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PortfoliosAssetsService } from '../../../../core/services/portfolios-assets.service';
import { PortfolioAsset } from '../../../../core/dtos/portfolio-asset.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import {
  PaginatorConfig,
  TableAction,
  TableComponent,
  TableHeader,
  TableRow,
} from '../../../../shared/components/table/table.component';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../core/dtos/request';
import { DeletePortfolioAssetModalComponent } from './delete-portfolio-asset-modal/delete-portfolio-asset-modal.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { CommonService } from '../../../../core/services/common.service';
import { Observable, tap } from 'rxjs';

interface PortfolioAssetTableRowData {
  id: number;
  asset: string;
  category: string;
  currentPrice: string;
  action: string;
  position: string;
  quantity: number;
  actions: {
    delete: boolean;
  };
}

@Component({
  selector: 'app-portfolio-assets-list',
  imports: [TableComponent, DeletePortfolioAssetModalComponent],
  templateUrl: './portfolio-assets-list.component.html',
})
export class PortfolioAssetsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly portfolioAssets = signal<PortfolioAsset[]>([]);

  public readonly deletePortfolioAssetComponent = viewChild(
    DeletePortfolioAssetModalComponent,
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableData: Signal<PortfolioAssetTableRowData[]> = computed(
    () =>
      this.portfolioAssets().map((portfolioAsset) => {
        const { asset, quantity, action } = portfolioAsset;
        const { currency, assetHistoricalPrices } = asset;
        const [lastPrice] = assetHistoricalPrices;
        const closingPrice = lastPrice?.closingPrice || 0;

        return {
          id: portfolioAsset.id,
          asset: asset.code,
          category: portfolioAsset.asset.category,
          class: portfolioAsset.asset.class,
          currentPrice: formatCurrency(currency, closingPrice),
          position: formatCurrency(currency, quantity * closingPrice),
          action: action || '-',
          quantity: quantity,
          actions: {
            delete: true,
          },
        };
      }),
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'asset', value: 'Asset' },
    { key: 'category', value: 'Category' },
    { key: 'class', value: 'Class' },
    { key: 'quantity', value: 'Quantity' },
    { key: 'currentPrice', value: 'Current Price' },
    { key: 'position', value: 'Position' },
    { key: 'action', value: 'Action' },
    { key: 'actions', value: '' },
  ];
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.getPortfolioAssets().subscribe();
  }

  public handleRowClick(row: TableRow): void {
    const portfolioAssetRowData = row as PortfolioAssetTableRowData;

    this.router.navigate([portfolioAssetRowData.id], {
      relativeTo: this.activatedRoute,
    });
  }

  public handlePageClick(event: PageEvent): void {
    this.getPortfolioAssets({
      limit: event.pageSize,
      page: event.pageIndex,
    }).subscribe();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const portfolioAssetTableRowData = action.row as PortfolioAssetTableRowData;

    if (action.name === 'delete') {
      const deletePortfolioAssetModalComponent =
        this.deletePortfolioAssetComponent();

      this.modalRef = this.dialog.open(ModalComponent, {
        autoFocus: 'dialog',
        data: {
          title: 'Excluir Ativo',
          contentTemplate:
            deletePortfolioAssetModalComponent?.deletePortfolioAssetModalContentTemplate(),
          actionsTemplate:
            deletePortfolioAssetModalComponent?.deletePortfolioAssetModalActionsTemplate(),
          context: {
            portfolioAssetId: portfolioAssetTableRowData.id,
          },
        },
      });
    }
  }

  public updatePortfoliosAssetsList(): void {
    this.getPortfolioAssets().subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getPortfolioAssets(
    getRequestParams?: GetRequestParams,
  ): Observable<GetRequestResponse<PortfolioAsset>> {
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

    return this.portfoliosAssetsService.get({ portfolioId, ...params }).pipe(
      tap((getPortfolioAssetsResponse) => {
        const { data, total, page, itemsPerPage } = getPortfolioAssetsResponse;

        this.portfolioAssets.set(data);
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
