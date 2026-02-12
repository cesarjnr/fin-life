import { Component, computed, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonService } from '../../../../../core/services/common.service';
import { PortfoliosAssetsService } from '../../../../../core/services/portfolios-assets.service';
import {
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';

interface AssetMonthlyVariationTableRowData {
  asset: string;
  price: string;
  variation: string;
}

@Component({
  selector: 'app-portfolio-assets-monthly-variation',
  imports: [TableComponent],
  templateUrl: './portfolio-assets-monthly-variation.component.html',
  styleUrl: './portfolio-assets-monthly-variation.component.scss',
})
export class PortfolioAssetsMonthlyVariationComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly portfoliosAssetsMonthlyVariations = signal<any[]>([]);

  public readonly tableData: Signal<AssetMonthlyVariationTableRowData[]> =
    computed(() => []);
  public readonly tableHeaders: TableHeader[] = [
    { key: 'asset', value: 'Ativo' },
    { key: 'price', value: 'Preço' },
    { key: 'variation', value: 'Variação' },
  ];
}
