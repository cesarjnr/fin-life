import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '../../../core/services/auth.service';
import { Portfolio } from '../../../core/dtos/portfolio.dto';

interface SidebarNavItem {
  label: string;
  icon?: string;
  navigateTo?: string;
  route?: string;
  subItems?: SidebarNavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    LogoComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public readonly selectedItem = signal<SidebarNavItem | undefined>(undefined);
  public readonly items: SidebarNavItem[] = [
    {
      label: 'Admin',
      icon: 'folder',
      route: 'admin',
      subItems: [{ label: 'Produtos', navigateTo: '/admin/products' }],
    },
    {
      label: 'Portfólio',
      icon: 'account_balance_wallet',
      route: 'portfolios',
      subItems: [
        { label: 'Ativos', navigateTo: '/portfolios/:portfolioId/assets' },
        {
          label: 'Operações',
          navigateTo: '/portfolios/:portfolioId/buys-sells',
        },
      ],
    },
  ];

  public ngOnInit(): void {
    this.setupNavConfigs();
  }

  public handleItemClick(item: SidebarNavItem): void {
    if (item.label !== this.selectedItem()?.label) {
      this.selectedItem.set(item);
    } else {
      this.selectedItem.set(undefined);
    }
  }

  private setupNavConfigs(): void {
    const user = this.authService.getLoggedInUser()!;
    const defaultPortfolio = user.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.replaceItemRouteParamsConfig(defaultPortfolio, this.items);
    this.setInitialSelectedItem();
  }

  private replaceItemRouteParamsConfig(
    portfolio: Portfolio,
    items?: SidebarNavItem[],
  ): void {
    if (items?.length) {
      items.forEach((item) => {
        if (item.navigateTo) {
          item.navigateTo = item.navigateTo.replace(
            ':portfolioId',
            String(portfolio.id),
          );
        }

        this.replaceItemRouteParamsConfig(portfolio, item.subItems);
      });
    }
  }

  private setInitialSelectedItem(): void {
    const baseRoute = this.router.url.split('/')[1];
    const currentItem = this.items.find((item) => item.route === baseRoute);

    this.selectedItem.set(currentItem);
  }
}

// Redirect user to respective portal if already logged in and tries accessing the login route
// Implement logout
