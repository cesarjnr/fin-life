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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as echarts from 'echarts';
import { Observable, tap } from 'rxjs';

import { CommonService } from '../../../../core/services/common.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PortfoliosAssetsService } from '../../../../core/services/portfolios-assets.service';
import { ChartsService } from '../../../../core/services/charts.service';
import {
  ChartGroupByOptions,
  DividendsChartData,
  GetChartDataDto,
} from '../../../../core/dtos/chart.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { AssetCurrencies } from '../../../../core/dtos/asset.dto';
import { PortfolioAsset } from '../../../../core/dtos/portfolio-asset.dto';
import { User } from '../../../../core/dtos/user.dto';
import { PayoutsChartFiltersModalComponent } from './payouts-chart-filters-modal/payouts-chart-filters-modal.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-payouts-chart',
  imports: [MatButtonModule, MatIconModule, PayoutsChartFiltersModalComponent],
  templateUrl: './payouts-chart.component.html',
  styleUrl: './payouts-chart.component.scss',
})
export class PayoutsChartComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly chartsService = inject(ChartsService);
  private readonly dividendsChartData = signal<DividendsChartData[]>([]);
  private chart: echarts.ECharts | null = null;
  private loggedUser: User | null = null;

  public readonly portfoliosAssets = signal<PortfolioAsset[]>([]);
  public readonly chartContainer = viewChild<ElementRef>('chartContainer');
  public readonly payoutsChartFiltersModalComponent = viewChild(
    PayoutsChartFiltersModalComponent,
  );
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();

    this.getPortfoliosAssets();
    this.getPortfolioAssetsDividendsChartData({
      groupBy: ChartGroupByOptions.Year,
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
    this.getPortfolioAssetsDividendsChartData(getChartDataDto).subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();

    this.modalRef = undefined;
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

  private getPortfolioAssetsDividendsChartData(
    getChartDataDto?: Partial<GetChartDataDto>,
  ): Observable<DividendsChartData[]> {
    const defaultPortfolio = this.loggedUser!.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);

    return this.chartsService
      .getDividendsChartData({
        ...getChartDataDto,
        portfolioId: defaultPortfolio.id,
      })
      .pipe(
        tap((dividendsChartData) => {
          this.dividendsChartData.set(dividendsChartData);
          this.commonService.setLoading(false);
          this.setupChart();
        }),
      );
  }

  private setupChart(): void {
    if (this.dividendsChartData().length && this.chart) {
      const series: any[] = [];
      const xAxisData: string[] = [];
      const totalByPeriod: any = {};

      this.dividendsChartData().forEach((dividendChartData) => {
        series.push({
          name: dividendChartData.label,
          type: 'bar',
          stack: 'total',
          barMaxWidth: '30',
          data: dividendChartData.data.map((data) => {
            if (!xAxisData.includes(data.period)) {
              xAxisData.push(data.period);
            }

            if (totalByPeriod[data.period]) {
              totalByPeriod[data.period] += data.value;
            } else {
              totalByPeriod[data.period] = data.value;
            }

            return data.value;
          }),
        });
      });
      series.push({
        type: 'bar',
        stack: 'total',
        label: {
          color: '#FFF',
          show: true,
          offset: [0, -15],
          formatter: (params: any) => {
            return formatCurrency(
              AssetCurrencies.BRL,
              totalByPeriod[params.name],
            );
          },
        },
        data: xAxisData.map(() => 0),
      });
      this.chart.clear();

      const visibileBars = 9;
      const totalBars = xAxisData.length;
      const dataZoomStart =
        totalBars > visibileBars
          ? ((totalBars - visibileBars) / totalBars) * 100
          : 0;

      this.chart.setOption({
        legend: {
          selectedMode: false,
          textStyle: {
            color: '#FFF',
          },
        },
        grid: {
          top: 100,
          bottom: 120,
        },
        tooltip: {
          formatter: (params: any) => {
            console.log(params);

            return `
              <div style="display: flex;flex-direction: column;gap: 0.5rem;">
                <div style="font-weight: bold;">${params.seriesName}</div>
                <div style="display: flex;flex-direction: column;gap: 0.275rem;">
                  <span>Valor: ${formatCurrency(AssetCurrencies.BRL, params.value)}</span>
                  <span>Yield: 0%</span>
                </div>
              </div>
            `;
          },
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 90,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: 'R$ {value}',
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
        color: [
          '#5470c6',
          '#91cc75',
          '#fac858',
          '#ee6666',
          '#73c0de',
          '#3ba272',
          '#fc8452',
          '#9a60b4',
          '#ea7ccc',
          '#ff9f7f',
          '#ffdb5c',
          '#37a2ff',
        ],
        series,
      });
    }
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
