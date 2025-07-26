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
import { PortfoliosAssetsDividendsService } from '../../../../core/services/portfolios-assets-dividends.service';
import { PortfolioAssetsDividendsOverview } from '../../../../core/dtos/portfolio-asset-dividend.dto';
import {
  OverviewCardComponent,
  OverviewCardInput,
} from '../../../../shared/components/overview-card/overview-card.component';
import { formatCurrency } from '../../../../shared/utils/number';
import { AssetCurrencies } from '../../../../core/dtos/asset.dto';

@Component({
  selector: 'app-payouts-overview',
  imports: [OverviewCardComponent],
  templateUrl: './payouts-overview.component.html',
  styleUrl: './payouts-overview.component.scss',
})
export class PayoutsOverviewComponent implements OnInit {
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly portfolioAssetsDividendsOverview =
    signal<PortfolioAssetsDividendsOverview>({
      total: 0,
      yieldOnCost: 0,
    });
  private portfolioAssetsDividendsOverviewKeysLabelsMap = new Map<
    string,
    string
  >([
    ['total', 'Total'],
    ['yieldOnCost', 'Yield'],
  ]);

  public readonly portfolioAssetsDividendsOverviewCards: Signal<
    OverviewCardInput[]
  > = computed(() => {
    const portfolioAssetsDividendsOverviewEntries = Object.entries(
      this.portfolioAssetsDividendsOverview() || {},
    );
    const titlesToFormat = ['Total', 'Yield'];

    return portfolioAssetsDividendsOverviewEntries.map(([key, value]) => ({
      title: this.portfolioAssetsDividendsOverviewKeysLabelsMap.get(key)!,
      rawValue: value,
      formattedValue:
        key === 'yieldOnCost'
          ? `${(value * 100).toFixed(2)}%`
          : formatCurrency(AssetCurrencies.BRL, value),
      addValueIndicatorStyle: titlesToFormat.includes(
        this.portfolioAssetsDividendsOverviewKeysLabelsMap.get(key)!,
      ),
    }));
  });

  public ngOnInit(): void {
    this.getPortfolioAssetsDividendsAssetsOverview();
  }

  private getPortfolioAssetsDividendsAssetsOverview(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.portfoliosAssetsDividendsService
      .getOverview(defaultPortfolio.id)
      .subscribe({
        next: (porrtfolioAssetsDividendsOverview) => {
          this.portfolioAssetsDividendsOverview.set(
            porrtfolioAssetsDividendsOverview,
          );
          this.commonService.setLoading(false);
        },
      });
  }
}
