import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

import { Asset } from '../../../../../core/dtos/asset.dto';
import { formatCurrency } from '../../../../../shared/utils/currency';
import { AssetsService } from '../../../../../core/services/assets.service';

@Component({
  selector: 'app-product-overview',
  imports: [MatButtonModule],
  templateUrl: './product-overview.component.html',
  styleUrl: './product-overview.component.scss',
})
export class ProductOverviewComponent {
  public readonly activatedRoute = inject(ActivatedRoute);
  public readonly assetsService = inject(AssetsService);
  public readonly asset = input<Asset>();
  public readonly updateAsset = output<Asset>();
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

  public handleSyncPricesButtonClick(): void {
    const assetId = this.activatedRoute.snapshot.params['id'];

    this.assetsService.syncPrices(assetId).subscribe({
      next: (asset) => {
        this.updateAsset.emit(asset);
      },
    });
  }

  public handleEditButtonClick(): void {}
}
