import {
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
  signal,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import {
  PaginatorConfig,
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';
import { PortfoliosAssetsDividendsService } from '../../../../../core/services/portfolios-assets-dividends.service';
import { PortfolioAssetDividend } from '../../../../../core/dtos/portfolio-asset-dividend.dto';
import { formatCurrency } from '../../../../../shared/utils/number';
import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';
import { PaginationParams } from '../../../../../core/dtos/pagination.dto';
import { AuthService } from '../../../../../core/services/auth.service';

interface PortfolioAssetDividendRowData {
  date: string;
  type: string;
  quantity: number;
  value: string;
  taxes: string;
  total: string;
}

@Component({
  selector: 'app-portfolio-asset-dividends',
  imports: [TableComponent],
  templateUrl: './portfolio-asset-dividends.component.html',
})
export class PortfolioAssetDividendsComponent {
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly portfolioAssetsDividends = signal<PortfolioAssetDividend[]>(
    [],
  );

  public portfolioAsset = input<PortfolioAsset>();
  public readonly tableData: Signal<PortfolioAssetDividendRowData[]> = computed(
    () =>
      this.portfolioAssetsDividends().map((portfolioAssetDividend) => ({
        date: portfolioAssetDividend.date,
        type: portfolioAssetDividend.type,
        quantity: portfolioAssetDividend.quantity,
        value: formatCurrency(
          this.portfolioAsset()!.asset.currency,
          portfolioAssetDividend.value,
        ),
        taxes: formatCurrency(
          this.portfolioAsset()!.asset.currency,
          portfolioAssetDividend.taxes,
        ),
        total: formatCurrency(
          this.portfolioAsset()!.asset.currency,
          portfolioAssetDividend.total,
        ),
      })),
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'date', value: 'Data' },
    { key: 'type', value: 'Tipo' },
    { key: 'quantity', value: 'Quantidade' },
    { key: 'value', value: 'Valor' },
    { key: 'taxes', value: 'Impostos' },
    { key: 'total', value: 'Total' },
  ];

  constructor() {
    effect(() => {
      if (this.portfolioAsset() && !this.paginatorConfig()) {
        this.getPortfolioAssetDividends();
      }
    });
  }

  public handlePageClick(event: PageEvent): void {
    this.getPortfolioAssetDividends({
      limit: event.pageSize,
      page: event.pageIndex,
    });
  }

  private getPortfolioAssetDividends(
    paginationParams?: PaginationParams,
  ): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const params = {
      ...(paginationParams ?? { limit: 10, page: 0 }),
      portfolioAssetId: this.portfolioAsset()!.id,
    };

    this.portfoliosAssetsDividendsService
      .get(loggedUser.id, defaultPortfolio.id, params)
      .subscribe({
        next: (getPortfolioAssetDividendsResponse) => {
          const { data, total, page, itemsPerPage } =
            getPortfolioAssetDividendsResponse;

          this.portfolioAssetsDividends.set(data);
          this.paginatorConfig.set({
            length: total,
            pageIndex: page!,
            pageSize: itemsPerPage!,
          });
        },
      });
  }
}
