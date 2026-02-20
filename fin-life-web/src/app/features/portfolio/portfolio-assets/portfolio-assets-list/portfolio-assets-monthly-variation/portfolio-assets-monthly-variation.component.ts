import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { CommonService } from '../../../../../core/services/common.service';
import { PortfoliosAssetsService } from '../../../../../core/services/portfolios-assets.service';
import {
  TableComponent,
  TableHeader,
} from '../../../../../shared/components/table/table.component';
import { PortfolioAssetsMonthlyVariation } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  formatCurrency,
  formatPercentage,
} from '../../../../../shared/utils/number';

interface AssetMonthlyVariationTableRowData {
  asset: string;
  price: string;
  variation: string | SafeHtml;
}

@Component({
  selector: 'app-portfolio-assets-monthly-variation',
  imports: [TableComponent],
  templateUrl: './portfolio-assets-monthly-variation.component.html',
  styleUrl: './portfolio-assets-monthly-variation.component.scss',
})
export class PortfolioAssetsMonthlyVariationComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private readonly portfoliosAssetsMonthlyVariations = signal<
    PortfolioAssetsMonthlyVariation[]
  >([]);

  public readonly tableData: Signal<AssetMonthlyVariationTableRowData[]> =
    computed(() =>
      this.portfoliosAssetsMonthlyVariations().map(
        (portfolioAssetMonthlyVariation) => {
          const formattedVariation = formatPercentage(
            portfolioAssetMonthlyVariation.variation,
          );

          return {
            asset: portfolioAssetMonthlyVariation.asset,
            price: formatCurrency(
              portfolioAssetMonthlyVariation.assetCurrency,
              portfolioAssetMonthlyVariation.currentPrice,
            ),
            variation: this.sanitizer.bypassSecurityTrustHtml(
              `<span style="color:${portfolioAssetMonthlyVariation.variation < 0 ? '#ba1a1a' : 'var(--mat-sys-primary)'}">${formattedVariation}</span>`,
            ),
          };
        },
      ),
    );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'asset', value: 'Ativo' },
    { key: 'price', value: 'Preço' },
    { key: 'variation', value: 'Variação' },
  ];

  public ngOnInit(): void {
    this.getPortfolioAssetsMonthlyVariations();
  }

  private getPortfolioAssetsMonthlyVariations(): void {
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId')!,
    );

    this.commonService.setLoading(true);
    this.portfoliosAssetsService.getMonthlyVariations(portfolioId).subscribe({
      next: (portfolioAssetsMonthlyVariations) => {
        this.portfoliosAssetsMonthlyVariations.set(
          portfolioAssetsMonthlyVariations,
        );
        this.commonService.setLoading(false);
      },
    });
  }
}
