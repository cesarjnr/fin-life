import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';

import { CommonService } from '../../../../core/services/common.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PortfoliosAssetsPayoutsService } from '../../../../core/services/portfolios-assets-payouts.service';
import { PortfolioAssetsPayoutsOverview } from '../../../../core/dtos/portfolio-asset-payout.dto';
import {
  OverviewCardComponent,
  OverviewCardInput,
} from '../../../../shared/components/overview-card/overview-card.component';
import { formatCurrency } from '../../../../shared/utils/number';
import { Currencies } from '../../../../core/dtos/common.dto';

@Component({
  selector: 'app-payouts-overview',
  imports: [OverviewCardComponent],
  templateUrl: './payouts-overview.component.html',
  styleUrl: './payouts-overview.component.scss',
})
export class PayoutsOverviewComponent implements OnInit {
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly payoutsService = inject(PortfoliosAssetsPayoutsService);
  private readonly payoutsOverview = signal<PortfolioAssetsPayoutsOverview>({
    total: 0,
    yieldOnCost: 0,
  });
  private payoutsOverviewKeysLabelsMap = new Map<string, string>([
    ['total', 'Total'],
    ['yieldOnCost', 'Yield'],
  ]);

  public readonly payoutsOverviewCards: Signal<OverviewCardInput[]> = computed(
    () => {
      const payoutsOverviewEntries = Object.entries(
        this.payoutsOverview() || {},
      );
      const titlesToFormat = ['Total', 'Yield'];

      return payoutsOverviewEntries.map(([key, value]) => ({
        title: this.payoutsOverviewKeysLabelsMap.get(key)!,
        rawValue: value,
        formattedValue:
          key === 'yieldOnCost'
            ? `${(value * 100).toFixed(2)}%`
            : formatCurrency(Currencies.BRL, value),
        addValueIndicatorStyle: titlesToFormat.includes(
          this.payoutsOverviewKeysLabelsMap.get(key)!,
        ),
      }));
    },
  );

  public ngOnInit(): void {
    this.getPayoutsOverview();
  }

  private getPayoutsOverview(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.payoutsService.getOverview(defaultPortfolio.id).subscribe({
      next: (payoutsOverview) => {
        this.payoutsOverview.set(payoutsOverview);
        this.commonService.setLoading(false);
      },
    });
  }
}
