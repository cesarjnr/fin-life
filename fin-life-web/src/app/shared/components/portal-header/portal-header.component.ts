import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-portal-header',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent {
  public readonly menuButtonClick = output<void>();
  public openMenu = false;

  public handleOpenMenuButtonClick(): void {
    this.openMenu = !this.openMenu;
  }
}
