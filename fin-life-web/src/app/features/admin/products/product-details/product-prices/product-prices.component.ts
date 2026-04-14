import { Component, effect, inject, input, signal } from "@angular/core";

import { AreaChartComponent, AreaChartData } from "../../../../../shared/components/area-chart/area-chart-component";
import { ProductHistoricalPricesService } from "../../../../../core/services/product-historical-prices.service";
import { Asset } from "../../../../../core/dtos/asset.dto";

@Component({
  selector: 'app-product-prices',
  imports: [AreaChartComponent],
  templateUrl: './product-prices.component.html',
  styleUrls: ['./product-prices.component.scss']
})
export class ProductPricesComponent {
  private readonly productHistoricalPricesService = inject(ProductHistoricalPricesService);

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

    this.productHistoricalPricesService.get(asset.id).subscribe({
      next: (getProductHistoricalPricesResponse) => {
        const { data } = getProductHistoricalPricesResponse;

        this.productHistoricalPriceChartData.set(data.map((productHistoricalPrice) => ({
          x: productHistoricalPrice.date,
          y: productHistoricalPrice.closingPrice,
          currency: asset.currency
        })));
      },
    });
  }
}
