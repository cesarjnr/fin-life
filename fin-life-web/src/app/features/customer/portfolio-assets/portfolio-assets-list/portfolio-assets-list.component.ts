import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PortfolioAssetsService } from '../../../../core/services/portfolio-assets.service';
import { PortfolioAsset } from '../../../../core/dtos/portfolio-asset.dto';
import { formatCurrency } from '../../../../shared/utils/number';
import {
  TableComponent,
  TableHeader,
  TableRow,
} from '../../../../shared/components/table/table.component';

interface PortfolioAssetTableRowData {
  assetId: number;
  asset: string;
  category: string;
  currentPrice: string;
  movement: string;
  position: string;
  quantity: number;
}

@Component({
  selector: 'app-portfolio-assets-list',
  imports: [TableComponent],
  templateUrl: './portfolio-assets-list.component.html',
})
export class PortfolioAssetsListComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private readonly portfolioAssetsService = inject(PortfolioAssetsService);

  public readonly portfolioAssets = signal<PortfolioAsset[]>([]);
  public readonly tableHeaders: TableHeader[] = [
    { key: 'asset', value: 'Asset' },
    { key: 'category', value: 'Category' },
    { key: 'class', value: 'Class' },
    { key: 'quantity', value: 'Quantity' },
    { key: 'currentPrice', value: 'Current Price' },
    { key: 'position', value: 'Position' },
    { key: 'movement', value: 'Movement' },
  ];
  public readonly tableData: Signal<PortfolioAssetTableRowData[]> = computed(
    () =>
      this.portfolioAssets().map((portfolioAsset) => {
        const { asset, quantity, movement } = portfolioAsset;
        const { currency, assetHistoricalPrices } = asset;
        const [lastPrice] = assetHistoricalPrices;

        return {
          assetId: portfolioAsset.assetId,
          asset: asset.ticker,
          category: portfolioAsset.asset.category,
          class: portfolioAsset.asset.class,
          currentPrice: formatCurrency(currency, lastPrice.closingPrice),
          position: formatCurrency(currency, quantity * lastPrice.closingPrice),
          movement: movement || '-',
          quantity: quantity,
        };
      }),
  );

  public ngOnInit(): void {
    this.getPortfolioAssets();
  }

  public handleRowClick(row: TableRow): void {
    const portfolioAssetRowData = row as PortfolioAssetTableRowData;

    this.router.navigate([portfolioAssetRowData.assetId], {
      relativeTo: this.activatedRoute,
    });
  }

  private getPortfolioAssets(): void {
    this.portfolioAssetsService.get(1, 1).subscribe({
      next: (getPortfolioAssetsResponse) => {
        this.portfolioAssets.set(getPortfolioAssetsResponse);
      },
    });
  }
}
