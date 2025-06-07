import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { PortfolioAssetOverviewComponent } from './portfolio-asset-overview/portfolio-asset-overview.component';

@Component({
  selector: 'app-portfolio-asset-details',
  imports: [MatTabsModule, PortfolioAssetOverviewComponent],
  templateUrl: './portfolio-asset-details.component.html',
  styleUrl: './portfolio-asset-details.component.scss',
})
export class PortfolioAssetDetailsComponent {}
