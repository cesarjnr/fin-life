import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
// import { CurrencyPipe } from '@angular/common';

import { CommonService } from '../../../../core/services/common.service';
import { PayoutsService } from '../../../../core/services/payouts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payout } from '../../../../core/dtos/payout.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import {
  TableComponent,
  TableHeader,
} from '../../../../shared/components/table/table.component';
import {
  endOfMonth,
  formatDate,
  startOfMonth,
} from '../../../../shared/utils/date';

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
  private readonly payoutsService = inject(PayoutsService);
  private readonly payouts = signal<Payout[]>([]);

  public readonly tableData: Signal<PayoutTableRowData[]> = computed(() =>
    this.payouts().map((payout) => ({
      asset: payout.portfolioAsset.asset.code,
      date: formatDate(payout.date),
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
    const from = startOfMonth(new Date());
    const to = endOfMonth(new Date());

    this.commonService.setLoading(true);
    this.payoutsService
      .get(defaultPortfolio.id, {
        from,
        to,
      })
      .subscribe({
        next: (payouts) => {
          this.payouts.set(payouts.data);
          this.commonService.setLoading(false);
        },
      });
  }
}
