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

import { AssetsService } from '../../../core/services/assets.service';
import { Asset } from '../../../core/dtos/asset.dto';
import {
  TableHeader,
  TableComponent,
  TableRow,
} from '../../../shared/components/table/table.component';
import { formatCurrency } from '../../../shared/utils/currency';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AddProductModalComponent } from './add-product-modal/add-product-modal.component';

interface ProductsTableRowData {
  ticker: string;
  category: string;
  class: string;
  lastPrice: string;
  sector: string;
}

@Component({
  selector: 'app-products',
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    AddProductModalComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private readonly dialog = inject(MatDialog);

  public readonly assetsService = inject(AssetsService);
  public readonly addProductModalComponent = viewChild(
    AddProductModalComponent,
  );
  public readonly assets = signal<Asset[]>([]);
  public readonly tableHeaders: TableHeader[] = [
    { key: 'ticker', value: 'Ticker' },
    { key: 'category', value: 'Category' },
    { key: 'class', value: 'Class' },
    { key: 'sector', value: 'Sector' },
    { key: 'lastPrice', value: 'Last Price' },
    // { key: 'active', value: '' },
  ];
  public readonly tableData: Signal<ProductsTableRowData[]> = computed(() =>
    this.assets().map((asset) => ({
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
    console.log(row);
  }

  public handleAddButtonClick(): void {
    const addProductModalComponent = this.addProductModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Add Product',
        contentTemplate:
          addProductModalComponent?.addProductModalContentTemplate(),
        actionsTemplate:
          addProductModalComponent?.addProductModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleCreateProduct(asset: Asset): void {
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
