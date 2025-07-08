import { Component } from '@angular/core';

import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardOverviewComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
