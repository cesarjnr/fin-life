import { Routes } from '@angular/router';

import { PortfolioAssetsComponent } from './features/customer/portfolio-assets/portfolio-assets.component';
import { BuysSellsComponent } from './features/customer/buys-sells/buys-sells.component';
import { ProductsComponent } from './features/admin/products/products.component';

export const routes: Routes = [
  {
    path: 'admin/products',
    component: ProductsComponent,
  },
  {
    path: 'portfolios/:portfolioId/assets',
    component: PortfolioAssetsComponent,
  },
  { path: 'portfolios/:portfolioId/buys-sells', component: BuysSellsComponent },
];
