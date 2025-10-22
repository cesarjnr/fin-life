import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as echarts from 'echarts';
import { Observable, tap } from 'rxjs';

import { CommonService } from '../../../../core/services/common.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PortfoliosAssetsService } from '../../../../core/services/portfolios-assets.service';
import { ChartsService } from '../../../../core/services/charts.service';
import {
  ChartGroupByPeriods,
  PayoutsChartData,
  GetChartDataDto,
} from '../../../../core/dtos/chart.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { PortfolioAsset } from '../../../../core/dtos/portfolio-asset.dto';
import { User } from '../../../../core/dtos/user.dto';
import { PayoutsChartFiltersModalComponent } from './payouts-chart-filters-modal/payouts-chart-filters-modal.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { chartColors } from '../../../../shared/utils/chart';
import { Currencies } from '../../../../core/dtos/common.dto';

@Component({
  selector: 'app-payouts-chart',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    PayoutsChartFiltersModalComponent,
  ],
  templateUrl: './payouts-chart.component.html',
  styleUrl: './payouts-chart.component.scss',
})
export class PayoutsChartComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly chartsService = inject(ChartsService);
  private readonly payoutsChartData = signal<PayoutsChartData[]>([]);
  private chart: echarts.ECharts | null = null;
  private loggedUser: User | null = null;

  public readonly portfoliosAssets = signal<PortfolioAsset[]>([]);
  public readonly chartContainer = viewChild<ElementRef>('chartContainer');
  public readonly payoutsChartFiltersModalComponent = viewChild(
    PayoutsChartFiltersModalComponent,
  );
  public readonly display = new FormControl('value', { nonNullable: true });
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();

    this.getPortfoliosAssets();
    this.getPayoutsChartData({
      groupByPeriod: ChartGroupByPeriods.Year,
    }).subscribe();
  }

  public ngAfterViewInit(): void {
    this.initChart();
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  public handleFilterListButtonClick(): void {
    const payoutsChartFiltersModalComponent =
      this.payoutsChartFiltersModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        contentTemplate:
          payoutsChartFiltersModalComponent?.payoutsChartFiltersModalContentTemplate(),
        actionsTemplate:
          payoutsChartFiltersModalComponent?.payoutsChartFiltersModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleConfirmFilters(getChartDataDto: Partial<GetChartDataDto>): void {
    this.getPayoutsChartData(getChartDataDto).subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
  }

  public setupChart(): void {
    if (this.payoutsChartData().length && this.chart) {
      const dimensions: string[] = ['period'];
      const source: Record<string, string | number>[] = [];

      this.payoutsChartData().forEach((payoutChartData) => {
        const { data, period } = payoutChartData;
        const barData: Record<string, string | number> = { period };
        let totalBarValue = 0;
        let totalBarPosition = 0;

        data.forEach((data) => {
          if (!dimensions.includes(data.label)) {
            dimensions.push(data.label);
          }

          barData[data.label] =
            this.display.value === 'value' ? data.value : data.yield * 100;
          totalBarValue += data.value;
          totalBarPosition += data.labelPosition;
        });

        barData['totalValue'] = totalBarValue;
        barData['totalPosition'] = totalBarPosition;
        barData['total'] = 0;
        source.push(barData);
      });
      dimensions.push('total');

      const visibileBars = 9;
      const totalBars = source.length - 1;
      const dataZoomStart =
        totalBars > visibileBars
          ? ((totalBars - visibileBars) / totalBars) * 100
          : 0;

      this.chart.clear();
      this.chart.setOption({
        dataset: { dimensions, source },
        legend: {
          data: [...dimensions]
            .slice(1, dimensions.length - 1)
            .map((dimension) => ({ name: dimension })),
          selectedMode: false,
          textStyle: {
            color: '#FFF',
          },
        },
        grid: {
          top: 100,
          containLabel: true,
        },
        tooltip: {
          formatter: (params: any) => {
            if (params.seriesName === 'total') return '';

            const label = this.display.value === 'value' ? 'Valor' : 'Yield';
            const valueToDisplay =
              this.display.value === 'value'
                ? formatCurrency(Currencies.BRL, params.data[params.seriesName])
                : `${params.data[params.seriesName].toFixed(2)}%`;

            return `
              <div style="display: flex;flex-direction: column;gap: 0.5rem;">
                <div style="font-weight: bold;">${params.seriesName}</div>
                <div style="display: flex;flex-direction: column;gap: 0.275rem;">
                  <span>${label}: ${valueToDisplay}</span>
                </div>
              </div>
            `;
          },
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            rotate: 90,
          },
        },
        yAxis: {
          show: this.display.value === 'value',
          type: 'value',
          axisLabel: {
            formatter: (value: number) => {
              const valueToDisplay =
                this.display.value === 'value' ? `R$ ${value}` : `${value}%`;

              return valueToDisplay;
            },
          },
          splitLine: {
            show: false,
          },
        },
        dataZoom: [
          {
            type: 'inside',
            start: dataZoomStart,
            end: 100,
          },
          {
            start: dataZoomStart,
            end: 100,
          },
        ],
        color: chartColors,
        series: dimensions.slice(1).map((dimension) => {
          const serie: Record<string, any> = {
            type: 'bar',
            stack: 'total',
          };

          if (dimension !== 'total') {
            serie['barMaxWidth'] = '30';
          } else {
            serie['label'] = {
              color: '#fff',
              show: true,
              position: 'top',
              // offset: [0, -15],
              formatter: (params: any) => {
                const totalValue = params.data.totalValue;
                const totalPosition = params.data.totalPosition;

                return this.display.value === 'value'
                  ? formatCurrency(Currencies.BRL, totalValue)
                  : `${((totalValue / totalPosition) * 100).toFixed(2)}%`;
              },
            };
          }

          return serie;
        }),
      });
    }
  }

  private getPortfoliosAssets(): void {
    const defaultPortfolio = this.loggedUser!.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.portfoliosAssetsService
      .get({ portfolioId: defaultPortfolio.id })
      .subscribe({
        next: (portfoliosAssetsResponse) => {
          this.portfoliosAssets.set(portfoliosAssetsResponse.data);
          this.commonService.setLoading(false);
        },
      });
  }

  private getPayoutsChartData(
    getChartDataDto?: Partial<GetChartDataDto>,
  ): Observable<PayoutsChartData[]> {
    const defaultPortfolio = this.loggedUser!.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);

    return this.chartsService
      .getPayoutsChartData({
        ...getChartDataDto,
        portfolioId: defaultPortfolio.id,
      })
      .pipe(
        tap((payoutsChartData) => {
          this.payoutsChartData.set(payoutsChartData);
          this.commonService.setLoading(false);
          this.setupChart();
        }),
      );
  }

  private initChart(): void {
    const containerRef = this.chartContainer();

    setTimeout(() => {
      if (containerRef && containerRef.nativeElement) {
        this.chart = echarts.init(containerRef.nativeElement);

        const canvasContainer = containerRef.nativeElement.querySelector('div');

        if (canvasContainer) {
          canvasContainer.style.width = '100%';
          canvasContainer.style.height = '100%';

          window.addEventListener('resize', () => {
            this.chart?.resize();
          });
        }
      }
    });
  }
}
