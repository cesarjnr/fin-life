import { Routes } from '@angular/router';

import { PortfolioAssetsComponent } from './features/portfolio-assets/portfolio-assets.component';
import { BuysSellsComponent } from './features/buys-sells/buys-sells.component';

export const routes: Routes = [
  { path: 'portfolios/:portfolioId/assets', component: PortfolioAssetsComponent },
  { path: 'portfolios/:portfolioId/buys-sells', component: BuysSellsComponent }
];
