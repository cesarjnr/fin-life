import { Routes } from '@angular/router';

import { PortfolioAssetsComponent } from './features/customer/portfolio-assets/portfolio-assets.component';
import { BuysSellsComponent } from './features/customer/buys-sells/buys-sells.component';
import { ProductsComponent } from './features/admin/products/products.component';
import { ProductsListComponent } from './features/admin/products/products-list/products-list.component';
import { ProductDetailsComponent } from './features/admin/products/product-details/product-details.component';

export const routes: Routes = [
  {
    path: 'admin/products',
    component: ProductsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Products',
        component: ProductsListComponent,
      },
      {
        path: ':id',
        title: 'Product Details',
        component: ProductDetailsComponent,
      },
    ],
  },
  {
    path: 'portfolios/:portfolioId/assets',
    title: 'Portfolio Assets',
    component: PortfolioAssetsComponent,
  },
  {
    path: 'portfolios/:portfolioId/buys-sells',
    title: 'Operations',
    component: BuysSellsComponent,
  },
];
