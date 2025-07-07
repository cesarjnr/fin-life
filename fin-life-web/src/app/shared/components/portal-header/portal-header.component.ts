import { Component, inject, OnInit, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

import { User } from '../../../core/dtos/user.dto';
import { AuthService } from '../../../core/services/auth.service';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-portal-header',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);

  public readonly menuButtonClick = output<void>();
  public readonly loggedInUser = signal<User | null>(null);
  public openMenu = false;
  public hasRendered = false;

  public ngOnInit(): void {
    this.loggedInUser.set(this.authService.getLoggedInUser());

    setTimeout(() => {
      this.hasRendered = true;
    });
  }

  public handleOpenMenuButtonClick(): void {
    this.openMenu = !this.openMenu;
  }

  public handleLogoutButtonClick(): void {
    this.commonService.setLoading(true);
    this.authService.logout().subscribe({
      next: () => {
        this.commonService.setLoading(false);
        this.router.navigate(['auth', 'login']);
        localStorage.clear();
      },
    });
  }
}
