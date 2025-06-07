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

import { AssetsService } from '../../../../core/services/assets.service';
import { Asset } from '../../../../core/dtos/asset.dto';
import {
  TableHeader,
  TableComponent,
  TableRow,
} from '../../../../shared/components/table/table.component';
import { formatCurrency } from '../../../../shared/utils/number';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ProductModalComponent } from '../product-modal/product-modal.component';

interface ProductsTableRowData {
  id: number;
  ticker: string;
  category: string;
  class: string;
  lastPrice: string;
  sector: string;
}

@Component({
  selector: 'app-products-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    ProductModalComponent,
  ],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly assetsService = inject(AssetsService);
  public readonly productModalComponent = viewChild(ProductModalComponent);
  public readonly assets = signal<Asset[]>([]);
  public readonly tableHeaders: TableHeader[] = [
    { key: 'ticker', value: 'Código' },
    { key: 'category', value: 'Categoria' },
    { key: 'class', value: 'Classe' },
    { key: 'sector', value: 'Setor' },
    { key: 'lastPrice', value: 'Preço' },
    // { key: 'active', value: '' },
  ];
  public readonly tableData: Signal<ProductsTableRowData[]> = computed(() =>
    this.assets().map((asset) => ({
      id: asset.id,
      ticker: asset.ticker,
      category: asset.category,
      class: asset.class,
      lastPrice: formatCurrency(
        asset.currency,
        asset.assetHistoricalPrices[0].closingPrice,
      ),
      sector: asset.sector,
    })),
  );
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.getAssets();
  }

  public handleRowClick(row: TableRow): void {
    const productRowData = row as ProductsTableRowData;

    this.router.navigate([productRowData.id], {
      relativeTo: this.activatedRoute,
    });
  }

  public handleAddButtonClick(): void {
    const productModalComponent = this.productModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Add Product',
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

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  private getAssets(): void {
    this.assetsService.get().subscribe({
      next: (assetsResponse) => {
        this.assets.set(assetsResponse);
      },
    });
  }
}
