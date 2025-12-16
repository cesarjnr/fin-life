import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonService } from '../../../../../core/services/common.service';
import { PortfoliosAssetsService } from '../../../../../core/services/portfolios-assets.service';
import { PortfolioAssetMetrics } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  formatCurrency,
  formatPercentage,
} from '../../../../../shared/utils/number';
import { AuthService } from '../../../../../core/services/auth.service';
import { Portfolio } from '../../../../../core/dtos/portfolio.dto';

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
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly authService = inject(AuthService);
  private readonly portfolioAssetMetrics = signal<
    PortfolioAssetMetrics | undefined
  >(undefined);
  private selectedPortfolio?: Portfolio;
  private assetId?: number;

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
            label: 'Preço Médio',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.averageCost,
            ),
          },
          {
            label: 'Queda Sobre o Preço Médio',
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
            label: '% Atual',
            valueToDisplay: formatPercentage(
              portfolioAssetMetrics.currentPercentage,
            ),
          },
          {
            label: '% Esperada',
            valueToDisplay: `${formatPercentage(portfolioAssetMetrics.minPercentage || 0, false)}-${formatPercentage(portfolioAssetMetrics.maxPercentage || 0, false)}`,
          },
        ],
        [
          {
            label: 'Proventos',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.payoutsReceived,
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
    const loggedUser = this.authService.getLoggedUser()!;

    this.selectedPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    this.assetId = Number(
      this.activatedRoute.snapshot.paramMap.get('assetId')!,
    );

    this.getPortfolioAssetMetrics();
  }

  public getPortfolioAssetMetrics(): void {
    this.commonService.setLoading(true);
    this.portfoliosAssetsService
      .getMetrics(this.selectedPortfolio!.id, this.assetId!)
      .subscribe({
        next: (portfolioAssetMetrics) => {
          this.portfolioAssetMetrics.set(portfolioAssetMetrics);
          this.commonService.setLoading(false);
        },
      });
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
}
