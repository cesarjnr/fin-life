import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { PortalHeaderComponent } from '../../shared/components/portal-header/portal-header.component';

@Component({
  selector: 'app-admin',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    SidebarComponent,
    PortalHeaderComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {}
