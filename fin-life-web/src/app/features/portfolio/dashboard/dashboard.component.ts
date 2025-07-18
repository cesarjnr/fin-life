import { Component } from '@angular/core';

import { PortfolioOverviewComponent } from './portfolio-overview/portfolio-overview.component';
import { PortfolioAllocationComponent } from './portfolio-allocation/portfolio-allocation.component';

@Component({
  selector: 'app-dashboard',
  imports: [PortfolioOverviewComponent, PortfolioAllocationComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
