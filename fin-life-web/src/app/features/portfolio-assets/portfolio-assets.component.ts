import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';

import { PortfolioAssetsService } from '../../core/services/portfolio-assets.service';
import { PortfolioAsset } from '../../core/dtos/portfolio-asset.dto';
import { formatCurrency } from '../../shared/utils/currency';
import { TableComponent, TableHeader } from "../../shared/components/table/table.component";

interface PortfolioAssetTableData {
  asset: string;
  quantity: number;
  averageCost: string;
  currentPrice: string;
  dividendsPaid: string;
}

@Component({
  selector: 'app-portfolio-assets',
  imports: [TableComponent],
  templateUrl: './portfolio-assets.component.html',
  styleUrl: './portfolio-assets.component.scss'
})
export class PortfolioAssetsComponent implements OnInit {
  private portfolioAssetsService = inject(PortfolioAssetsService);
  public portfolioAssets = signal<PortfolioAsset[]>([]);
  public tableHeaders: TableHeader[] = [
    { key: 'asset', value: 'Asset' },
    { key: 'quantity', value: 'Quantity' },
    { key: 'averageCost', value: 'Average Cost' },
    { key: 'currentPrice', value: 'Current Price' },
    { key: 'dividendsPaid', value: 'Dividends Paid' },
  ];
  public tableData: Signal<PortfolioAssetTableData[]> = computed(() => this.portfolioAssets().map((portfolioAsset) => {
    const { asset, quantity, averageCost, dividendsPaid } = portfolioAsset;
    const { currency, assetHistoricalPrices } = asset;

    return {
      asset: asset.ticker,
      quantity: quantity,
      averageCost: formatCurrency(currency, averageCost),
      currentPrice: formatCurrency(currency, assetHistoricalPrices[0].closingPrice),
      dividendsPaid: formatCurrency(currency, dividendsPaid)
    };
  }));

  public ngOnInit(): void {
    this.getPortfolioAssets();
  }

  private getPortfolioAssets(): void {
    this.portfolioAssetsService.get(1, 1).subscribe({
      next: (getPortfolioAssetsResponse) => {
        console.log(getPortfolioAssetsResponse);
          
        this.portfolioAssets.set(getPortfolioAssetsResponse);
      }
    });
  }
}
