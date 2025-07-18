import { Component } from '@angular/core';

import { PayoutsOverviewComponent } from './payouts-overview/payouts-overview.component';
import { PayoutsChartComponent } from './payouts-chart/payouts-chart.component';
import { PayoutListComponent } from './payout-list/payout-list.component';

@Component({
  selector: 'app-payouts',
  imports: [
    PayoutsOverviewComponent,
    PayoutsChartComponent,
    PayoutListComponent,
  ],
  templateUrl: './payouts.component.html',
  styleUrl: './payouts.component.scss',
})
export class PayoutsComponent {}
