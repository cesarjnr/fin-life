import { Component } from '@angular/core';

import { PortfolioOverviewComponent } from './portfolio-overview/portfolio-overview.component';
import { PortfolioAllocationComponent } from './portfolio-allocation/portfolio-allocation.component';
import { PortfolioPerformanceComponent } from './portfolio-performance/portfolio-performance.component';
import { PortfolioDividendsComponent } from './portfolio-dividends/portfolio-dividends.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    PortfolioOverviewComponent,
    PortfolioAllocationComponent,
    PortfolioPerformanceComponent,
    PortfolioDividendsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
