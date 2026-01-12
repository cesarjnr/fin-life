import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { AdminComponent } from './features/admin/admin.component';
import { ProductsComponent } from './features/admin/products/products.component';
import { ProductsListComponent } from './features/admin/products/products-list/products-list.component';
import { ProductDetailsComponent } from './features/admin/products/product-details/product-details.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { DashboardComponent } from './features/portfolio/dashboard/dashboard.component';
import { PortfolioAssetsComponent } from './features/portfolio/portfolio-assets/portfolio-assets.component';
import { PortfolioAssetsListComponent } from './features/portfolio/portfolio-assets/portfolio-assets-list/portfolio-assets-list.component';
import { PortfolioAssetDetailsComponent } from './features/portfolio/portfolio-assets/portfolio-asset-details/portfolio-asset-details.component';
import { OperationsComponent } from './features/portfolio/operations/operations.component';
import { authGuard } from './shared/guards/auth.guard';
import { PayoutsComponent } from './features/portfolio/payouts/payouts.component';

const authRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [authGuard],
        component: LoginComponent,
      },
    ],
  },
];
const adminRoutes: Routes = [
  {
    path: 'admin',
    pathMatch: 'full',
    redirectTo: 'admin/products',
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'products',
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
    ],
  },
];
const customerRoutes: Routes = [
  {
    path: 'portfolios',
    component: PortfolioComponent,
    canActivate: [authGuard],
    children: [
      {
        path: ':portfolioId',
        pathMatch: 'full',
        redirectTo: ':portfolioId/dashboard',
      },
      {
        path: ':portfolioId/dashboard',
        title: 'Dashboard',
        component: DashboardComponent,
      },
      {
        path: ':portfolioId/portfolios-assets',
        component: PortfolioAssetsComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            title: 'Ativos',
            component: PortfolioAssetsListComponent,
          },
          {
            path: ':assetId',
            title: 'Detalhes do Ativo',
            component: PortfolioAssetDetailsComponent,
          },
        ],
      },
      {
        path: ':portfolioId/operations',
        title: 'Operações',
        component: OperationsComponent,
      },
      {
        path: ':portfolioId/payouts',
        title: 'Proventos',
        component: PayoutsComponent,
      },
    ],
  },
];

export const routes: Routes = [
  ...authRoutes,
  ...adminRoutes,
  ...customerRoutes,
];
