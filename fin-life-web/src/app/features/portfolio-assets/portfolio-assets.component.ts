import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';

import { PortfolioAssetsService } from '../../core/services/portfolio-assets.service';
import { PortfolioAsset } from '../../core/dtos/portfolio-asset.dto';
import { formatCurrency } from '../../shared/utils/currency';
import { TableComponent, TableHeader, TableRow } from "../../shared/components/table/table.component";

interface PortfolioAssetTableRowData {
  asset: string;
  category: string;
  currentPrice: string;
  movement: string;
  position: string;
  quantity: number;
}

@Component({
  selector: 'app-portfolio-assets',
  imports: [TableComponent],
  templateUrl: './portfolio-assets.component.html',
  styleUrl: './portfolio-assets.component.scss'
})
export class PortfolioAssetsComponent implements OnInit {
  private readonly portfolioAssetsService = inject(PortfolioAssetsService);
  public readonly portfolioAssets = signal<PortfolioAsset[]>([]);
  public readonly tableHeaders: TableHeader[] = [
    { key: 'asset', value: 'Asset' },
    { key: 'category', value: 'Category' },
    { key: 'class', value: 'Class' },
    { key: 'quantity', value: 'Quantity' },
    { key: 'currentPrice', value: 'Current Price' },
    { key: 'position', value: 'Position' },
    { key: 'movement', value: 'Movement' }
  ];
  public readonly tableData: Signal<PortfolioAssetTableRowData[]> = computed(() => this.portfolioAssets().map((portfolioAsset) => {
    const { asset, quantity, movement } = portfolioAsset;
    const { currency, assetHistoricalPrices } = asset;
    const [lastPrice] = assetHistoricalPrices;

    return {
      asset: asset.ticker,
      category: portfolioAsset.asset.category,
      class: portfolioAsset.asset.class,
      currentPrice: formatCurrency(currency, lastPrice.closingPrice),
      position: formatCurrency(currency, quantity * lastPrice.closingPrice),
      movement: movement || '-',
      quantity: quantity,
    };
  }));

  public ngOnInit(): void {
    this.getPortfolioAssets();
  }

  public handleRowClick(row: TableRow): void {
    const portfolioAssetRowData = row as PortfolioAssetTableRowData;

    console.log(portfolioAssetRowData);
  }

  private getPortfolioAssets(): void {
    this.portfolioAssetsService.get(1, 1).subscribe({
      next: (getPortfolioAssetsResponse) => {          
        this.portfolioAssets.set(getPortfolioAssetsResponse);
      }
    });
  }
}
