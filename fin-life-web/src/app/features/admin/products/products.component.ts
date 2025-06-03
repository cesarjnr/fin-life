import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AssetsService } from '../../../core/services/assets.service';
import { Asset } from '../../../core/dtos/asset.dto';
import {
  TableHeader,
  TableComponent,
  TableRow,
} from '../../../shared/components/table/table.component';

interface ProductsTableRowData {
  ticker: string;
  category: string;
  class: string;
  sector: string;
}

@Component({
  selector: 'app-products',
  imports: [TableComponent, MatButtonModule, MatIconModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  public readonly assetsService = inject(AssetsService);
  public readonly assets = signal<Asset[]>([]);
  public readonly tableHeaders: TableHeader[] = [
    { key: 'ticker', value: 'Ticker' },
    { key: 'category', value: 'Category' },
    { key: 'class', value: 'Class' },
    { key: 'sector', value: 'Sector' },
    // { key: 'active', value: '' },
  ];
  public readonly tableData: Signal<ProductsTableRowData[]> = computed(() =>
    this.assets().map((asset) => ({
      ticker: asset.ticker,
      category: asset.category,
      class: asset.class,
      sector: asset.sector,
    })),
  );

  public ngOnInit(): void {
    this.getAssets();
  }

  public handleRowClick(row: TableRow): void {
    console.log(row);
  }

  private getAssets(): void {
    this.assetsService.get().subscribe({
      next: (assetsResponse) => {
        this.assets.set(assetsResponse);
      },
    });
  }
}
