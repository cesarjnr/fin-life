import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { ProductModalComponent } from '../../product-modal/product-modal.component';
import { Asset } from '../../../../../core/dtos/asset.dto';
import { formatCurrency } from '../../../../../shared/utils/number';
import { CommonService } from '../../../../../core/services/common.service';
import { AssetsService } from '../../../../../core/services/assets.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-product-overview',
  imports: [MatButton, MatIcon, ProductModalComponent],
  templateUrl: './product-overview.component.html',
  styleUrl: './product-overview.component.scss',
})
export class ProductOverviewComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly assetsService = inject(AssetsService);

  public readonly productModalComponent = viewChild(ProductModalComponent);
  public readonly asset = signal<Asset | undefined>(undefined);
  public readonly assetInfoRows = computed(() => {
    const assetInfoRows: [string, string][] = [];
    const asset = this.asset();

    if (asset) {
      const assetLatestValue =
        asset.assetHistoricalPrices[asset.assetHistoricalPrices.length - 1]
          ?.closingPrice ?? 0;

      assetInfoRows.push(
        ['Código', asset.code],
        ['Categoria', asset.category],
        ['Classe', asset.class],
        ['Setor', asset.sector || '-'],
        ['Preço Atual', formatCurrency(asset.currency, assetLatestValue)],
        [
          'Preço Mais Alto',
          formatCurrency(asset.currency, asset.allTimeHighPrice),
        ],
      );
    }

    return assetInfoRows;
  });
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.findAsset();
  }

  public handleSyncPricesButtonClick(): void {
    this.commonService.setLoading(true);

    const assetId = Number(this.activatedRoute.snapshot.paramMap.get('id')!);

    this.assetsService.syncPrices({ assetId }).subscribe({
      next: ([asset]) => {
        this.asset.update((currentValue) => {
          const latestPrice = asset.assetHistoricalPrices.length
            ? [
                asset.assetHistoricalPrices[
                  asset.assetHistoricalPrices.length - 1
                ],
              ]
            : currentValue!.assetHistoricalPrices;

          return Object.assign({}, currentValue, asset, {
            assetHistoricalPrices: latestPrice,
          });
        });
        this.toastrService.success('Preços do ativo sincronizados com sucesso');
        this.commonService.setLoading(false);
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

  private findAsset(): void {
    const assetId = Number(this.activatedRoute.snapshot.paramMap.get('id')!);

    this.assetsService.find(assetId).subscribe({
      next: (asset) => {
        this.asset.set(asset);
      },
    });
  }
}
