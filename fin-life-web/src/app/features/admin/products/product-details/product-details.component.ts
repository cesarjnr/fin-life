import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { ProductDividendsComponent } from './product-dividends/product-dividends.component';
import { ProductSplitsComponent } from './product-splits/product-splits.component';
import { AssetsService } from '../../../../core/services/assets.service';
import { Asset } from '../../../../core/dtos/asset.dto';

@Component({
  selector: 'app-product-details',
  imports: [
    MatTabsModule,
    ProductOverviewComponent,
    ProductDividendsComponent,
    ProductSplitsComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly assetsService = inject(AssetsService);

  public readonly asset = signal<Asset | undefined>(undefined);

  public ngOnInit(): void {
    this.findAsset();
  }

  public handleUpdateAsset(asset: Asset): void {
    this.asset.set(asset);
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
