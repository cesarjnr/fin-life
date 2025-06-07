import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarNavItem {
  label: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  public items: SidebarNavItem[] = [
    { label: 'Produtos', link: 'admin/products' },
    { label: 'Ativos', link: 'portfolios/1/assets' },
    { label: 'Operações', link: 'portfolios/1/buys-sells' },
  ];
}
