import { Routes } from '@angular/router';

import { ProductsComponent } from './features/admin/products/products.component';
import { ProductsListComponent } from './features/admin/products/products-list/products-list.component';
import { ProductDetailsComponent } from './features/admin/products/product-details/product-details.component';
import { PortfolioAssetsComponent } from './features/customer/portfolio-assets/portfolio-assets.component';
import { PortfolioAssetsListComponent } from './features/customer/portfolio-assets/portfolio-assets-list/portfolio-assets-list.component';
import { PortfolioAssetDetailsComponent } from './features/customer/portfolio-assets/portfolio-asset-details/portfolio-asset-details.component';
import { BuysSellsComponent } from './features/customer/buys-sells/buys-sells.component';

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
    component: PortfolioAssetsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Assets',
        component: PortfolioAssetsListComponent,
      },
      {
        path: ':assetId',
        title: 'Asset Details',
        component: PortfolioAssetDetailsComponent,
      },
    ],
  },
  {
    path: 'portfolios/:portfolioId/buys-sells',
    title: 'Operations',
    component: BuysSellsComponent,
  },
];
