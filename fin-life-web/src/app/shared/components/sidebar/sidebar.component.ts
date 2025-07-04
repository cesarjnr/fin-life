import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ActivationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, filter } from 'rxjs';

import { LogoComponent } from '../logo/logo.component';

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

  public readonly selectedItem = signal<SidebarNavItem | undefined>(undefined);
  public readonly items: SidebarNavItem[] = [
    {
      label: 'Admin',
      icon: 'folder',
      route: 'admin',
      subItems: [{ label: 'Produtos', navigateTo: 'admin/products' }],
    },
    {
      label: 'Portfólio',
      icon: 'account_balance_wallet',
      route: 'portfolios',
      subItems: [
        { label: 'Ativos', navigateTo: 'portfolios/:portfolioId/assets' },
        {
          label: 'Operações',
          navigateTo: 'portfolios/:portfolioId/buys-sells',
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
    this.router.events
      .pipe(
        filter((event) => event instanceof ActivationEnd),
        debounceTime(50),
      )
      .subscribe({
        next: (event) => {
          const currentRouteParamsEntries = Object.entries(
            event.snapshot.params,
          );

          this.replaceItemRouteParamsConfig(
            currentRouteParamsEntries,
            this.items,
          );
          this.setInitialSelectedItem();
        },
      });
  }

  private replaceItemRouteParamsConfig(
    currentRouteParamsEntries: [string, any][],
    items?: SidebarNavItem[],
  ): void {
    if (items?.length) {
      items.forEach((item) => {
        currentRouteParamsEntries.forEach(([key, value]) => {
          item.navigateTo =
            item.navigateTo?.replace(`:${key}`, value) || item.navigateTo;
        });

        this.replaceItemRouteParamsConfig(
          currentRouteParamsEntries,
          item.subItems,
        );
      });
    }
  }

  private setInitialSelectedItem(): void {
    const baseRoute = this.router.url.split('/')[1];
    const currentItem = this.items.find((item) => item.route === baseRoute);

    this.selectedItem.set(currentItem);
  }
}
