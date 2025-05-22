import { Routes } from '@angular/router';

import { PortfolioAssetsComponent } from './features/portfolio-assets/portfolio-assets.component';

export const routes: Routes = [
  { path: 'portfolios/:portfolioId/assets', component: PortfolioAssetsComponent }
];
