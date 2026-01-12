import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';

import { PortfolioAssetsOverview } from '../../../../core/dtos/portfolio-asset.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { PortfoliosAssetsService } from '../../../../core/services/portfolios-assets.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonService } from '../../../../core/services/common.service';
import { OverviewCardInput } from '../../../../shared/components/overview-card/overview-card.component';
import { OverviewCardComponent } from '../../../../shared/components/overview-card/overview-card.component';
import { Currencies } from '../../../../core/dtos/common.dto';

@Component({
  selector: 'app-portfolio-overview',
  imports: [OverviewCardComponent],
  templateUrl: './portfolio-overview.component.html',
  styleUrl: './portfolio-overview.component.scss',
})
export class PortfolioOverviewComponent implements OnInit {
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);
  private readonly portfolioAssetsOverview = signal<PortfolioAssetsOverview>({
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

  public readonly portfolioAssetsOverviewCards: Signal<OverviewCardInput[]> =
    computed(() => {
      const portfolioOverviewEntries = Object.entries(
        this.portfolioAssetsOverview() || {},
      );
      const titlesToFormat = ['Lucro', 'Rentabilidade'];

      return portfolioOverviewEntries.map(([key, value]) => ({
        title: this.portfolioOverviewKeysLabelsMap.get(key)!,
        rawValue: value,
        formattedValue:
          key === 'profitability'
            ? `${(value * 100).toFixed(2)}%`
            : formatCurrency(Currencies.BRL, value),
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
    this.portfoliosAssetsService
      .getOverview(defaultPortfolio.id)
      .subscribe((portfolioAssetsOverview) => {
        this.portfolioAssetsOverview.set(portfolioAssetsOverview);
        this.commonService.setLoading(false);
      });
  }
}
