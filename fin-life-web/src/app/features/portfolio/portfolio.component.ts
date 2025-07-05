import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { PortalHeaderComponent } from '../../shared/components/portal-header/portal-header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-portfolio',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    SidebarComponent,
    PortalHeaderComponent,
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  public ngOnInit(): void {
    this.redirectUser();
  }

  private redirectUser(): void {
    const loggedInUser = this.authService.getLoggedInUser()!;
    const defaultPortfolio = loggedInUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.router.navigate([defaultPortfolio.id], { relativeTo: this.route });
  }
}
