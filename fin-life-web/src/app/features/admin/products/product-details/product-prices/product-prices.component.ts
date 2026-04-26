import { Component, effect, inject, input, signal } from '@angular/core';

import {
  AreaChartComponent,
  AreaChartData,
} from '../../../../../shared/components/area-chart/area-chart-component';
import { Asset } from '../../../../../core/dtos/asset.dto';
import { ChartsService } from '../../../../../core/services/charts.service';

@Component({
  selector: 'app-product-prices',
  imports: [AreaChartComponent],
  templateUrl: './product-prices.component.html',
  styleUrls: ['./product-prices.component.scss'],
})
export class ProductPricesComponent {
  private readonly chartsService = inject(ChartsService);

  public readonly asset = input<Asset | undefined>(undefined);
  public readonly productHistoricalPriceChartData = signal<AreaChartData[]>([]);

  constructor() {
    effect(() => {
      if (this.asset()) {
        this.getProductHistoricalPrices();
      }
    });
  }

  private getProductHistoricalPrices(): void {
    const asset = this.asset()!;

    this.chartsService.getAssetChartData({ assetId: asset.id }).subscribe({
      next: (getAssetChartDataResponse) => {
        this.productHistoricalPriceChartData.set(
          getAssetChartDataResponse.map((assetChartData) => ({
            x: assetChartData.date,
            y: assetChartData.value,
            currency: asset.currency,
          })),
        );
      },
    });
  }
}
