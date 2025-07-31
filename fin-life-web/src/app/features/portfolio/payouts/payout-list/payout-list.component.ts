import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
// import { CurrencyPipe } from '@angular/common';
import { endOfMonth, format, startOfMonth } from 'date-fns';

import { CommonService } from '../../../../core/services/common.service';
import { PortfoliosAssetsPayoutsService } from '../../../../core/services/portfolios-assets-payouts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PortfolioAssetPayout } from '../../../../core/dtos/portfolio-asset-payout.dto';
import { formatCurrency } from '../../../../shared/utils/number';
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
  imports: [/*CurrencyPipe,*/ TableComponent],
  templateUrl: './payout-list.component.html',
  styleUrl: './payout-list.component.scss',
})
export class PayoutListComponent implements OnInit {
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly payoutsService = inject(PortfoliosAssetsPayoutsService);
  private readonly payouts = signal<PortfolioAssetPayout[]>([]);

  public readonly tableData: Signal<PayoutTableRowData[]> = computed(() =>
    this.payouts().map((payout) => ({
      asset: payout.portfolioAsset.asset.ticker,
      date: format(`${payout.date}T00:00:00.000`, 'dd/MM/yyyy'),
      total: formatCurrency(payout.currency, payout.total),
    })),
  );
  public readonly total: Signal<number> = computed(() =>
    this.payouts().reduce((acc, payout) => acc + payout.total, 0),
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
    this.getPayouts();
  }

  private getPayouts(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const from = startOfMonth(new Date()).toISOString();
    const to = endOfMonth(new Date()).toISOString();

    this.commonService.setLoading(true);
    this.payoutsService.get(defaultPortfolio.id, { from, to }).subscribe({
      next: (payouts) => {
        this.payouts.set(payouts.data);
        this.commonService.setLoading(false);
      },
    });
  }
}
