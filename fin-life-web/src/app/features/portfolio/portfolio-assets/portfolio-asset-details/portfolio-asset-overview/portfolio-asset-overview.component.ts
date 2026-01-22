import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from '../../../../../core/services/common.service';
import { PortfoliosAssetsService } from '../../../../../core/services/portfolios-assets.service';
import { PortfolioAssetMetrics } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  formatCurrency,
  formatPercentage,
} from '../../../../../shared/utils/number';
import { AuthService } from '../../../../../core/services/auth.service';
import { Portfolio } from '../../../../../core/dtos/portfolio.dto';
import { minMaxValidator } from '../../../../../shared/directives/min-max.directive';

interface PortfolioAssetForm {
  characteristic: FormControl<string | null>;
  minPercentage: FormControl<number | null>;
  maxPercentage: FormControl<number | null>;
}
interface PortfolioAssetFormValues {
  characteristic: string | null | undefined;
  minPercentage: number;
  maxPercentage: number;
}

interface PortfolioAssetMetricInfoRow {
  applyValueIndicatorStyle?: boolean;
  clickableContent?: boolean;
  label: string;
  rawValue?: number | string;
  valueToDisplay: number | string;
}

@Component({
  selector: 'app-portfolio-asset-overview',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './portfolio-asset-overview.component.html',
  styleUrl: './portfolio-asset-overview.component.scss',
})
export class PortfolioAssetOverviewComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly authService = inject(AuthService);
  private readonly portfolioAssetMetrics = signal<
    PortfolioAssetMetrics | undefined
  >(undefined);
  private selectedPortfolio?: Portfolio;
  private portfolioAssetId?: number;

  public readonly portfolioAssetInfoRows = computed(() => {
    const portfolioAssetMetricsInfoRows: PortfolioAssetMetricInfoRow[][] = [];
    const portfolioAssetMetrics = this.portfolioAssetMetrics();

    if (portfolioAssetMetrics) {
      portfolioAssetMetricsInfoRows.push(
        [
          {
            label: 'Código',
            valueToDisplay: portfolioAssetMetrics.asset.code,
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
            label: 'Quantidade',
            valueToDisplay: portfolioAssetMetrics.quantity,
          },
          {
            label: 'Posição',
            valueToDisplay: formatCurrency(
              portfolioAssetMetrics.asset.currency,
              portfolioAssetMetrics.position,
            ),
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
            clickableContent: true,
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
            label: 'Yield s/ Custo',
            valueToDisplay: formatPercentage(portfolioAssetMetrics.yieldOnCost),
          },
        ],
        [
          {
            label: 'Rentabilidade',
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
            label: 'Rentabilidade Total',
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
  public readonly portfolioAssetForm =
    this.formBuilder.group<PortfolioAssetForm>(
      {
        characteristic: this.formBuilder.control(null),
        minPercentage: this.formBuilder.control(0),
        maxPercentage: this.formBuilder.control(0),
      },
      { validators: minMaxValidator() },
    );
  public displayPortfolioAssetForm = false;

  public get isFormInvalid(): boolean {
    return (
      this.portfolioAssetForm.hasError('exceededLimit') &&
      this.portfolioAssetForm.touched
    );
  }

  public ngOnInit(): void {
    const loggedUser = this.authService.getLoggedUser()!;

    this.selectedPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    this.portfolioAssetId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioAssetId')!,
    );

    this.getPortfolioAssetMetrics();
  }

  public getPortfolioAssetMetrics(): void {
    this.commonService.setLoading(true);
    this.portfoliosAssetsService
      .getMetrics(this.selectedPortfolio!.id, this.portfolioAssetId!)
      .subscribe({
        next: (portfolioAssetMetrics) => {
          this.portfolioAssetForm.setValue({
            characteristic: portfolioAssetMetrics.characteristic || null,
            minPercentage: portfolioAssetMetrics.minPercentage,
            maxPercentage: portfolioAssetMetrics.maxPercentage,
          });
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

  public handleSaveButtonClick(): void {
    if (this.portfolioAssetForm.valid) {
      const formValues: PortfolioAssetFormValues = {
        characteristic: this.portfolioAssetForm.value.characteristic,
        minPercentage: this.portfolioAssetForm.value.minPercentage! / 100,
        maxPercentage: this.portfolioAssetForm.value.maxPercentage! / 100,
      };
      const portfolioAssetMetrics = this.portfolioAssetMetrics()!;

      this.commonService.setLoading(true);
      this.portfoliosAssetsService
        .update(
          portfolioAssetMetrics.portfolioId,
          portfolioAssetMetrics.id,
          formValues,
        )
        .subscribe({
          next: () => {
            this.toastrService.success('Ativo atualizado com sucesso');
            this.portfolioAssetMetrics.set({
              ...this.portfolioAssetMetrics()!,
              minPercentage: formValues.minPercentage,
              maxPercentage: formValues.maxPercentage,
            });
            this.commonService.setLoading(false);

            this.displayPortfolioAssetForm = false;
          },
        });
    }
  }

  public handleInfoContentClick(): void {
    this.displayPortfolioAssetForm = true;
  }
}
