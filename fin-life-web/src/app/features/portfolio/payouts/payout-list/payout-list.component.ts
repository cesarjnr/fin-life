import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { endOfMonth, format, startOfMonth } from 'date-fns';

import { CommonService } from '../../../../core/services/common.service';
import { PortfoliosAssetsDividendsService } from '../../../../core/services/portfolios-assets-dividends.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PortfolioAssetDividend } from '../../../../core/dtos/portfolio-asset-dividend.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { AssetCurrencies } from '../../../../core/dtos/asset.dto';
import {
  TableComponent,
  TableHeader,
} from '../../../../shared/components/table/table.component';

interface PayoutTableRowData {
  asset: string;
  date: string;
  total: string;
}

@Component({
  selector: 'app-payout-list',
  imports: [CurrencyPipe, TableComponent],
  templateUrl: './payout-list.component.html',
  styleUrl: './payout-list.component.scss',
})
export class PayoutListComponent implements OnInit {
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly portfoliosAssetsDividends = signal<PortfolioAssetDividend[]>(
    [],
  );

  public readonly tableData: Signal<PayoutTableRowData[]> = computed(() =>
    this.portfoliosAssetsDividends().map((portfolioAssetDividend) => ({
      asset: portfolioAssetDividend.portfolioAsset.asset.ticker,
      date: format(`${portfolioAssetDividend.date}T00:00:00.000`, 'dd/MM/yyyy'),
      total: formatCurrency(AssetCurrencies.BRL, portfolioAssetDividend.total),
    })),
  );
  public readonly total: Signal<number> = computed(() =>
    this.portfoliosAssetsDividends().reduce(
      (acc, portfolioAssetDividend) => acc + portfolioAssetDividend.total,
      0,
    ),
  );
  public readonly tableHeaders: TableHeader[] = [
    {
      key: 'asset',
      value: 'Ativo',
    },
    {
      key: 'date',
      value: 'Data',
    },
    {
      key: 'total',
      value: 'Total',
    },
  ];

  public ngOnInit(): void {
    this.getPortfolioPayouts();
  }

  private getPortfolioPayouts(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const from = startOfMonth(new Date()).toISOString();
    const to = endOfMonth(new Date()).toISOString();

    this.commonService.setLoading(true);
    this.portfoliosAssetsDividendsService
      .get(defaultPortfolio.id, { from, to })
      .subscribe({
        next: (portfoliosAssetsDividends) => {
          this.portfoliosAssetsDividends.set(portfoliosAssetsDividends.data);
          this.commonService.setLoading(false);
        },
      });
  }
}
