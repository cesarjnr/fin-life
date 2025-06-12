import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { ProductDividendsComponent } from './product-dividends/product-dividends.component';
import { ProductSplitsComponent } from './product-splits/product-splits.component';

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
export class ProductDetailsComponent {}
