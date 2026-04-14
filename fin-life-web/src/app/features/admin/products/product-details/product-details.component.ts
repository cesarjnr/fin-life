import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { ProductPricesComponent } from './product-prices/product-prices.component';
import { ProductDividendsComponent } from './product-dividends/product-dividends.component';
import { ProductSplitsComponent } from './product-splits/product-splits.component';
import { ProductsService } from '../../../../core/services/products.service';
import { Asset } from '../../../../core/dtos/asset.dto';

@Component({
  selector: 'app-product-details',
  imports: [
    MatTabGroup,
    MatTab,
    ProductOverviewComponent,
    ProductPricesComponent,
    ProductDividendsComponent,
    ProductSplitsComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);

  public readonly asset = signal<Asset | undefined>(undefined);

  public ngOnInit(): void {
    this.findAsset();
  }

  private findAsset(): void {
    const assetId = Number(this.activatedRoute.snapshot.paramMap.get('id')!);

    this.productsService.find(assetId).subscribe({
      next: (asset) => {
        this.asset.set(asset);
      },
    });
  }
}
