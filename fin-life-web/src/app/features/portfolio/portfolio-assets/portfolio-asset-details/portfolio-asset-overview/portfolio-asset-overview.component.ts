import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PortfoliosAssetsService } from '../../../../../core/services/portfolios-assets.service';
import { PortfolioAssetMetrics } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  formatCurrency,
  formatPercentage,
} from '../../../../../shared/utils/number';
import { AuthService } from '../../../../../core/services/auth.service';

interface PortfolioAssetMetricInfoRow {
  applyValueIndicatorStyle?: boolean;
  label: string;
  rawValue?: number | string;
  valueToDisplay: number | string;
}

@Component({
  selector: 'app-portfolio-asset-overview',
  imports: [],
  templateUrl: './portfolio-asset-overview.component.html',
  styleUrl: './portfolio-asset-overview.component.scss',
})
export class PortfolioAssetOverviewComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly authService = inject(AuthService);
  private readonly portfolioAssetMetrics = signal<
    PortfolioAssetMetrics | undefined
  >(undefined);

  public readonly portfolioAssetInfoRows = computed(() => {
    const portfolioAssetMetricsInfoRows: PortfolioAssetMetricInfoRow[][] = [];
    const portfolioAssetMetrics = this.portfolioAssetMetrics();

    if (portfolioAssetMetrics) {
      portfolioAssetMetricsInfoRows.push(
        [
          {
            label: 'Código',
            valueToDisplay: portfolioAssetMetrics.asset.ticker,
          },
          {
            label: 'Cotação',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.asset.currentPrice,
            ),
          },
        ],
        [
          {
            label: 'Custo Médio',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.averageCost,
            ),
          },
          {
            label: 'Queda Sobre o Custo Médio',
            rawValue: -portfolioAssetMetrics.asset.dropOverAverageCost,
            valueToDisplay: formatPercentage(
              -portfolioAssetMetrics.asset.dropOverAverageCost,
            ),
            applyValueIndicatorStyle: true,
          },
        ],
        [
          {
            label: 'Máxima Histórica',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.asset.allTimeHighPrice,
            ),
          },
          {
            label: 'Queda Sobre a Máxima Histórica',
            rawValue: -portfolioAssetMetrics.asset.dropOverAllTimeHigh,
            valueToDisplay: formatPercentage(
              -portfolioAssetMetrics.asset.dropOverAllTimeHigh,
            ),
            applyValueIndicatorStyle: true,
          },
        ],
        [
          {
            label: 'Custo Total',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.cost,
            ),
          },
          {
            label: 'Quantidade',
            valueToDisplay: portfolioAssetMetrics.quantity,
          },
        ],
        [
          {
            label: 'Posição',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.position,
            ),
          },
          {
            label: 'Lucro Realizado',
            rawValue: portfolioAssetMetrics.salesTotal,
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.salesTotal,
            ),
            applyValueIndicatorStyle: true,
          },
        ],
        [
          {
            label: 'Proventos',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.dividends,
            ),
          },
          {
            label: 'Yield',
            valueToDisplay: formatPercentage(portfolioAssetMetrics.yieldOnCost),
          },
        ],
        [
          {
            label: 'Rentabilidade (R$)',
            rawValue: portfolioAssetMetrics.profitability,
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.profitability,
            ),
            applyValueIndicatorStyle: true,
          },
          {
            label: 'Rentabilidade (%)',
            rawValue: portfolioAssetMetrics.profitabilityInPercentage,
            valueToDisplay: formatPercentage(
              portfolioAssetMetrics.profitabilityInPercentage,
            ),
            applyValueIndicatorStyle: true,
          },
        ],
        [
          {
            label: 'Rentabilidade Total (R$)',
            rawValue: portfolioAssetMetrics.totalProfitability,
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.totalProfitability,
            ),
            applyValueIndicatorStyle: true,
          },
          {
            label: 'Rentabilidade Total (%)',
            rawValue: portfolioAssetMetrics.totalProfitabilityInPercentage,
            valueToDisplay: formatPercentage(
              portfolioAssetMetrics.totalProfitabilityInPercentage,
            ),
            applyValueIndicatorStyle: true,
          },
        ],
      );
    }

    return portfolioAssetMetricsInfoRows;
  });

  public ngOnInit(): void {
    this.getPortfolioAssetMetrics();
  }

  public getPortfolioAssetInfoValueClasses(
    portfolioAssetMetricInfoRow: PortfolioAssetMetricInfoRow,
  ): Record<string, boolean> {
    const portfolioAssetInfoValueClasses: Record<string, boolean> = {
      'portfolio-asset-info-value': true,
    };

    if (portfolioAssetMetricInfoRow.applyValueIndicatorStyle) {
      portfolioAssetInfoValueClasses['portfolio-asset-info-positive-value'] =
        Number(portfolioAssetMetricInfoRow.rawValue) > 0;
      portfolioAssetInfoValueClasses['portfolio-asset-info-negative-value'] =
        Number(portfolioAssetMetricInfoRow.rawValue) < 0;
    }

    return portfolioAssetInfoValueClasses;
  }

  private getPortfolioAssetMetrics(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const assetId = Number(
      this.activatedRoute.snapshot.paramMap.get('assetId')!,
    );

    this.portfoliosAssetsService
      .getMetrics(loggedUser.id, defaultPortfolio.id, assetId)
      .subscribe({
        next: (portfolioAssetMetrics) => {
          this.portfolioAssetMetrics.set(portfolioAssetMetrics);
        },
      });
  }
}
