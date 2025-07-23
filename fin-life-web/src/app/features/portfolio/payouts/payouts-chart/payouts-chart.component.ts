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
import * as echarts from 'echarts';

import { CommonService } from '../../../../core/services/common.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ChartsService } from '../../../../core/services/charts.service';
import {
  ChartGroupByOptions,
  DividendsChartData,
  GetChartDataDto,
} from '../../../../core/dtos/chart.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { AssetCurrencies } from '../../../../core/dtos/asset.dto';

@Component({
  selector: 'app-payouts-chart',
  imports: [],
  templateUrl: './payouts-chart.component.html',
  styleUrl: './payouts-chart.component.scss',
})
export class PayoutsChartComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly commonService = inject(CommonService);
  private readonly authService = inject(AuthService);
  private readonly chartsService = inject(ChartsService);
  private readonly dividendsChartData = signal<DividendsChartData[]>([]);
  private chart: echarts.ECharts | null = null;

  public readonly chartContainer = viewChild<ElementRef>('chartContainer');

  public ngOnInit(): void {
    this.getPortfolioAssetsDividendsChartData({
      groupBy: ChartGroupByOptions.Year,
    });
  }

  public ngAfterViewInit(): void {
    this.initChart();
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  private getPortfolioAssetsDividendsChartData(
    getChartDataDto?: Partial<GetChartDataDto>,
  ): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.chartsService
      .getDividendsChartData({
        ...getChartDataDto,
        portfolioId: defaultPortfolio.id,
      })
      .subscribe({
        next: (dividendsChartData) => {
          this.dividendsChartData.set(dividendsChartData);
          this.commonService.setLoading(false);
          this.setupChart();
        },
      });
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
          barWidth: '30%',
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
      this.chart.setOption({
        legend: {
          selectedMode: false,
          textStyle: {
            color: '#FFF',
          },
        },
        grid: {
          top: 100,
        },
        tooltip: {
          formatter: (params: any) => {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.seriesName}</div>
                <div>Valor: ${formatCurrency(AssetCurrencies.BRL, params.value)}</div>
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
