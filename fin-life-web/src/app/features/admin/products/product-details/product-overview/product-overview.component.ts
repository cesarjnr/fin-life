import { Component, computed, inject, model, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ProductModalComponent } from '../../product-modal/product-modal.component';
import { Asset } from '../../../../../core/dtos/asset.dto';
import { formatCurrency } from '../../../../../shared/utils/currency';
import { AssetsService } from '../../../../../core/services/assets.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-product-overview',
  imports: [MatButtonModule, ProductModalComponent],
  templateUrl: './product-overview.component.html',
  styleUrl: './product-overview.component.scss',
})
export class ProductOverviewComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly assetsService = inject(AssetsService);

  public readonly productModalComponent = viewChild(ProductModalComponent);
  public readonly asset = model<Asset>();
  public readonly assetInfoRows = computed(() => {
    const assetInfoRows: [string, string][] = [];
    const asset = this.asset();

    if (asset) {
      assetInfoRows.push(
        ['Código', asset.ticker],
        ['Categoria', asset.category],
        ['Classe', asset.class],
        ['Setor', asset.sector],
        [
          'Preço Atual',
          formatCurrency(
            asset.currency,
            asset.assetHistoricalPrices[0].closingPrice,
          ),
        ],
        [
          'Preço Mais Alto',
          formatCurrency(asset.currency, asset.allTimeHighPrice),
        ],
      );
    }

    return assetInfoRows;
  });
  public modalRef?: MatDialogRef<ModalComponent>;

  public handleSyncPricesButtonClick(): void {
    const assetId = this.activatedRoute.snapshot.params['id'];

    this.assetsService.syncPrices(assetId).subscribe({
      next: (asset) => {
        this.asset.update(() => asset);
      },
    });
  }

  public handleEditButtonClick(): void {
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
    this.asset.update(() => asset);
    this.closeModal();
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }
}
