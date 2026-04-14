import { AfterViewInit, Component, ElementRef, input, OnDestroy, viewChild } from "@angular/core";
import * as echarts from 'echarts';
import { formatCurrency } from "../../utils/number";
import { Currencies } from "../../../core/dtos/common.dto";

export interface AreaChartData {
  x: string;
  y: number;
  currency?: Currencies;
}

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent implements AfterViewInit, OnDestroy {
  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  public readonly chartContainer = viewChild<ElementRef>('chartContainer');
  public readonly chartData = input<AreaChartData[]>([]);

  public ngAfterViewInit(): void {
    const container = this.chartContainer()?.nativeElement;

    if (!container) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (!this.chart) {
            this.initChart(container);
          } else {
            this.chart.resize();
          }
        }
      }
    });

    this.resizeObserver.observe(container);
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }

  private initChart(container: HTMLElement): void {
    this.chart = echarts.init(container);
    this.chart.resize();
    this.setupChart();
  }

  private setupChart(): void {
    if (this.chart && this.chartData().length) {
      this.chart.clear();
      this.chart.setOption({
        dataset: {
          dimensions: ['x', 'y'],
          source: this.chartData(),
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const param = params[0];
            const value = param.data.currency ? formatCurrency(param.data.currency, param.data.y) : param.data.y;

            return `
              <div style="display: flex;flex-direction: column;gap: 0.5rem;">
                <div style="font-weight: bold;">${param.axisValue}</div>
                <div style="display: flex;flex-direction: column;gap: 0.275rem;">
                  <span>${value}</span>
                </div>
              </div>
            `;
          }
        },
        yAxis: {
          show: true,
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: (value: number) => {
              const currency = this.chartData()[0]?.currency;

              return currency ? formatCurrency(currency, value) : value.toString();
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            type: 'line',
            symbolSize: 0,
            areaStyle: {
              opacity: 0.5,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 229, 98, 0.3)' },
                { offset: 1, color: 'rgba(0, 229, 98, 0.1)' },
              ]),
            },
            lineStyle: {
              width: 1,
              color: '#00e562',
            }
          }
        ]
      })
    }
  }
}
