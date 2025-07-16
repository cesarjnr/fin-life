import {
  Component,
  inject,
  OnInit,
  signal,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import * as echarts from 'echarts';

import { AuthService } from '../../../../core/services/auth.service';
import { PortfoliosAssetsService } from '../../../../core/services/portfolios-assets.service';
import { PortfolioAsset } from '../../../../core/dtos/portfolio-asset.dto';
import { AssetCurrencies } from '../../../../core/dtos/asset.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import { CommonService } from '../../../../core/services/common.service';

interface ChartData {
  name: string;
  value: number;
  percentage: string;
}

@Component({
  selector: 'app-portfolio-allocation',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './portfolio-allocation.component.html',
  styleUrl: './portfolio-allocation.component.scss',
})
export class PortfolioAllocationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private authService = inject(AuthService);
  private readonly commonService = inject(CommonService);
  private portfoliosAssetsService = inject(PortfoliosAssetsService);
  private chart: echarts.ECharts | null = null;
  private groupedChartDataMap = new Map<string, Map<string, ChartData>>([
    ['ticker', new Map<string, ChartData>()],
    ['category', new Map<string, ChartData>()],
    ['class', new Map<string, ChartData>()],
    ['sector', new Map<string, ChartData>()],
  ]);

  public readonly groupBy = new FormControl('ticker');
  public readonly portfolioAssets = signal<PortfolioAsset[]>([]);
  public readonly chartContainer = viewChild<ElementRef>('chartContainer');
  public readonly groupByInputOptions = [
    { label: 'Ticker', value: 'ticker' },
    { label: 'Categoria', value: 'category' },
    { label: 'Classe', value: 'class' },
    { label: 'Setor', value: 'sector' },
  ];

  public ngOnInit(): void {
    this.getPortfolioAssets();
  }

  public ngAfterViewInit(): void {
    this.initChart();
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  public updateChart(): void {
    const group = this.groupedChartDataMap.get(this.groupBy.value!)!;
    const chartData = Array.from(group.values());

    if (chartData.length && this.chart) {
      const option: any = {
        title: {
          text: 'Alocação Atual',
          left: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
          },
        },
        tooltip: {
          formatter: (params: any) => {
            const data = params.data;

            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
                <div>Valor: ${formatCurrency(AssetCurrencies.BRL, data.value)}</div>
                <div>Alocação: ${data.percentage}%</div>
              </div>
            `;
          },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          formatter: (name: string) => {
            const asset = chartData.find((item) => item.name === name);

            return `${name} (${asset!.percentage}%)`;
          },
        },
        series: [
          {
            name: 'Portfolio Allocation',
            type: 'pie',
            radius: '50%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
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
      };

      this.chart.setOption(option);
    }
  }

  private getPortfolioAssets(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.portfoliosAssetsService
      .get(loggedUser.id, defaultPortfolio.id)
      .subscribe({
        next: (portfoliosAssets) => {
          this.portfolioAssets.set(portfoliosAssets);
          this.setChartDataMap();
          this.updateChart();
          this.commonService.setLoading(false);
        },
      });
  }

  private setChartDataMap(): void {
    const portfolioAssets = this.portfolioAssets();

    portfolioAssets
      .sort(
        (a, b) =>
          b.quantity * b.asset.assetHistoricalPrices[0].closingPrice -
          a.quantity * a.asset.assetHistoricalPrices[0].closingPrice,
      )
      .forEach((portfolioAsset) => {
        const { quantity, asset } = portfolioAsset;

        if (quantity > 0) {
          const portfolioCurrentValue = portfolioAssets.reduce(
            (totalValue, portfolioAsset) =>
              (totalValue +=
                portfolioAsset.quantity *
                portfolioAsset.asset.assetHistoricalPrices[0].closingPrice),
            0,
          );
          const assetPosition =
            quantity * asset.assetHistoricalPrices[0].closingPrice;
          const positionByTickerMap = this.groupedChartDataMap.get('ticker')!;
          const positionByCategoryMap =
            this.groupedChartDataMap.get('category')!;
          const correspondingCategoryPosition =
            (positionByCategoryMap.get(asset.category)?.value ?? 0) +
            assetPosition;
          const positionByClassMap = this.groupedChartDataMap.get('class')!;
          const correspondingClassPosition =
            (positionByClassMap.get(asset.class)?.value ?? 0) + assetPosition;
          const positionBySectorMap = this.groupedChartDataMap.get('sector')!;
          const correspondingSectorPosition =
            (positionBySectorMap.get(asset.sector)?.value ?? 0) + assetPosition;

          positionByTickerMap.set(asset.ticker, {
            name: asset.ticker,
            value: assetPosition,
            percentage: ((assetPosition / portfolioCurrentValue) * 100).toFixed(
              2,
            ),
          });
          positionByCategoryMap.set(asset.category, {
            name: asset.category,
            value: correspondingCategoryPosition,
            percentage: (
              (correspondingCategoryPosition / portfolioCurrentValue) *
              100
            ).toFixed(2),
          });
          positionByClassMap.set(asset.class, {
            name: asset.class,
            value: correspondingClassPosition,
            percentage: (
              (correspondingClassPosition / portfolioCurrentValue) *
              100
            ).toFixed(2),
          });
          positionBySectorMap.set(asset.sector, {
            name: asset.sector,
            value: correspondingSectorPosition,
            percentage: (
              (correspondingSectorPosition / portfolioCurrentValue) *
              100
            ).toFixed(2),
          });
        }
      });
  }

  private initChart(): void {
    const containerRef = this.chartContainer();

    if (containerRef && containerRef.nativeElement) {
      this.chart = echarts.init(containerRef.nativeElement);

      const canvasContainer = containerRef.nativeElement.querySelector('div');

      if (canvasContainer) {
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
      }
    }
  }
}
