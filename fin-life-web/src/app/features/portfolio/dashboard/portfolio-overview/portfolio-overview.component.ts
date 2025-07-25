import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';

import { PortfolioOverview } from '../../../../core/dtos/portfolio.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { AssetCurrencies } from '../../../../core/dtos/asset.dto';
import { PortfoliosService } from '../../../../core/services/portfolios.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonService } from '../../../../core/services/common.service';
import { OverviewCardInput } from '../../../../shared/components/overview-card/overview-card.component';
import { OverviewCardComponent } from '../../../../shared/components/overview-card/overview-card.component';

@Component({
  selector: 'app-portfolio-overview',
  imports: [OverviewCardComponent],
  templateUrl: './portfolio-overview.component.html',
  styleUrl: './portfolio-overview.component.scss',
})
export class PortfolioOverviewComponent implements OnInit {
  private readonly portfoliosService = inject(PortfoliosService);
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);
  private readonly portfolioOverview = signal<PortfolioOverview>({
    currentBalance: 0,
    investedBalance: 0,
    profit: 0,
    profitability: 0,
  });
  private portfolioOverviewKeysLabelsMap = new Map<string, string>([
    ['currentBalance', 'Patrimônio Atual'],
    ['investedBalance', 'Valor Aplicado'],
    ['profit', 'Lucro'],
    ['profitability', 'Rentabilidade'],
  ]);

  public readonly portfolioOverviewCards: Signal<OverviewCardInput[]> =
    computed(() => {
      const portfolioOverviewEntries = Object.entries(
        this.portfolioOverview() || {},
      );
      const titlesToFormat = ['Lucro', 'Rentabilidade'];

      return portfolioOverviewEntries.map(([key, value]) => ({
        title: this.portfolioOverviewKeysLabelsMap.get(key)!,
        rawValue: value,
        formattedValue:
          key === 'profitability'
            ? `${(value * 100).toFixed(2)}%`
            : formatCurrency(AssetCurrencies.BRL, value),
        addValueIndicatorStyle: titlesToFormat.includes(
          this.portfolioOverviewKeysLabelsMap.get(key)!,
        ),
      }));
    });

  public ngOnInit(): void {
    this.getPortfolioOverview();
  }

  public getPortfolioOverview(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.portfoliosService
      .getOverview(defaultPortfolio.id)
      .subscribe((portfolioOverview) => {
        this.portfolioOverview.set(portfolioOverview);
        this.commonService.setLoading(false);
      });
  }
}
