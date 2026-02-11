import { Component } from '@angular/core';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

import { MarketIndexOverviewComponent } from './market-index-overview/market-index-overview.component';

@Component({
  selector: 'app-market-index-details',
  imports: [MatTabGroup, MatTab, MarketIndexOverviewComponent],
  templateUrl: './market-index-details.component.html',
  styleUrl: './market-index-details.component.scss',
})
export class MarketIndexDetailsComponent {}
